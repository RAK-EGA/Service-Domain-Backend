const Request = require("../model/Request.js");
const axios = require('axios');
const cron = require('node-cron');
const { sendToEventBridge } = require('../eventBridge.js')


const submitRequest = async (req, res) => {
  try {
    const { additional_fields } = req.body;
    const { sla_value } = req.body;
    const { sla_unit } = req.body;
    const { requestName } = req.body;
    // console.log("*******************");
    // console.log(additional_fields);
    // Parse and validate additional_fields
    if (additional_fields && Array.isArray(additional_fields)) {
      for (const field of additional_fields) {
        if (field.condition) {
          const conditionType = field.condition.condition_type;

          if (conditionType === "selection") {
            // Check if the value is one of the allowed values
            const allowedValues = field.condition.values;
            const submittedValue = field.value;

            if (!allowedValues.includes(submittedValue)) {
              return res.status(400).json({ error: "Can't submit your request. Invalid value for the field." });
            }
          } else if (conditionType === "min-max") {
            // Check if the value is in the specified range
            const [min, max] = field.condition.values;
            const submittedValue = parseInt(field.value);

            if (submittedValue < min || submittedValue > max) {
              return res.status(400).json({ error: "Can't submit your request. Value is out of range." });
            }
          }
        }

        // Check if the type is "document" and ai_compatible is true
        if (field.field_type === "document" && field.is_ai_compatible) {
          // Call the external API to get document fields
          try {
            const aiResponse = await axios.post('https://rakmun-api.rakega.online/models/read-id', {
              image: field.value,
              category: field.document_type//@todo make sure field name is correct"
            });

            // console.log(field.value);
            // console.log(field.document_type);
            // Update the "fields" attribute with the AI response
            field.AI_fields = aiResponse.data;
            //console.log("*******************");
            //console.log(aiResponse.data);
          } catch (aiError) {
            console.error(aiError);
            return res.status(500).json({ error: "Error fetching document fields from external API." });
          }
        }
      }
    }

    const newRequest = new Request({
      citizenID: req.body.citizenID,
      serviceName: req.body.serviceName,
      serviceDetails: additional_fields,
      sla_value: sla_value,
      sla_unit: sla_unit,
      requestName,
    });

    await newRequest.save();

    newRequest.requestName = `${newRequest.serviceName}_${newRequest._id}`;
    console.log(newRequest);

    // Save the newComplain again to update the complainName
    await newRequest.save();

    res.json({ success: true, message: "Request submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const checkSla = async() => {
//     try {
//       // Fetch all requests from the database
//       const requests = await Request.find();

//       // Check SLA for each request
//       for (const request of requests) {
//         const createdTime = request.createdAt;
//         const currentTime = new Date();
//         const slaTime = request.serviceDetails.sla_value;
//         const timeDifference = currentTime - createdTime;

//         if (timeDifference > slaTime * 60 * 60 * 1000) { // Convert SLA time to milliseconds
//           // SLA exceeded, send to SQS
//           const exceededRequest = {
//             requestId: request._id,
//             slaExceededTime: timeDifference / (60 * 60 * 1000), // Convert to hours
//             // Add other relevant fields from the request
//           };

//           // Send to EventBridge
//           await sendToEventBridge(exceededRequest, process.env.RULE_ARN_CHECKSLA, "appRequestExceeded","checkSla");
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     }

// };


// const checkSla = async () => {
//   console.log("inside check sla");
//   try {
//     //Fetch all requests from the database
//     const requests = await Request.find();
//     console.log(requests);
//     // Check SLA for each request
//     for (const request of requests) {
//       const createdTime = new Date(request.createdAt); // Parse the createdAt field
//       const currentTime = new Date();
//       const slaTime = request.sla_value;
//       const timeDifference = currentTime - createdTime;

//       if (timeDifference > slaTime * 60 * 60 * 1000) {
//         // Convert SLA time to milliseconds
//         // SLA exceeded, send to SQS
//         const exceededRequest = {
//           requestId: request._id,
//           slaExceededTime: timeDifference / (60 * 60 * 1000), // Convert to hours
//           // Add other relevant fields from the request
//         };
//         console.log(exceededRequest);
//         // Send to EventBridge
//         await sendToEventBridge(exceededRequest, process.env.RULE_ARN_CHECKSLA, "appRequestExceeded", "checkSla");
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

const checkSla = async () => {
  console.log("inside check sla");
  try {
    // Fetch all requests from the database
    const requests = await Request.find();
    //console.log("requests..........................");
    //console.log(requests);

    // Check SLA for each request
    for (const request of requests) {
      const createdTime = new Date(request.createdAt); // Parse the createdAt field
      const currentTime = new Date();
      const slaTime = request.sla_value;
      const slaUnit = request.sla_unit;

      let slaMultiplier = 1; // Default multiplier is 1 (hours)

      // Check the unit of SLA
      if (slaUnit === 'Days') {
        slaMultiplier = 24; // Convert days to hours
      }

      const timeDifference = currentTime - createdTime;

      if (timeDifference > slaTime * slaMultiplier * 60 * 60 * 1000) {
        // Convert SLA time to milliseconds
        // SLA exceeded, send to SQS
        request.isExceeded = true;
        request.save();
        const exceededRequest = {
          requestId: request._id,
          slaExceededTime: timeDifference / (slaMultiplier * 60 * 60 * 1000), // Convert to hours
          // Add other relevant fields from the request
        };
        //console.log(exceededRequest);
        // Send to EventBridge
        await sendToEventBridge(exceededRequest, process.env.RULE_ARN_CHECKSLA, "appRequestExceeded", "checkSla");
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();

    if (!requests) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInProgressRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'IN_PROGRESS' });

    if (requests.length === 0) {
      return res.status(404).json({ error: "No requests in progress found" });
    }

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterAndSortRequests = async (req, res) => {
  try {
    let searchString = req.params.searchString;
    console.log(searchString);
    searchString = searchString.replace(/(\r\n|\n|\r)/gm, "");

    const tickets = await Request.aggregate([
      {
        $match: {
          $or: [
            { citizenID: { $regex: searchString } },
            { serviceName: { $regex: searchString } },
            { status: { $regex: searchString } },
            { serviceDetails: { $regex: searchString } },
          ],
        },
      },
      {
        $addFields: {
          customStatusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "OPEN"] }, then: 1 },
                { case: { $eq: ["$status", "IN_PROGRESS"] }, then: 2 },
                { case: { $eq: ["$status", "CANCELLED"] }, then: 3 },
                { case: { $eq: ["$status", "RESOLVED"] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $sort: {
          isExceeded: -1,
          customStatusOrder: 1,
          createdAt: -1,
        },
      },
    ]);

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (status === "RESOLVED") {
      updatedRequest.resolutionTime = (updatedRequest.updatedAt - updatedRequest.createdAt) / (1000 * 60 * 60);
    }
    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }
    const result = await Request.findById(updatedRequest._id)
    console.log(updatedRequest)
    updatedRequest.save();
    const requestDetails = JSON.stringify(updatedRequest);
    console.log(requestDetails)

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = {
  submitRequest,
  checkSla,
  getAllRequests,
  getRequest,
  getInProgressRequests,
  filterAndSortRequests,
  updateRequestStatus,
}