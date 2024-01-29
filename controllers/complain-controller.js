
const axios = require('axios');
  const Complain = require("../model/Complain");

const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { createEventBridgeClient } = require("../ebClient");
const {sendToEventBridge} = require('../eventBridge.js')
//const ebClientUpdate = createEventBridgeClient(process.env.RULE_ARN_UPDATE);
//const ebClientSubmission = createEventBridgeClient(process.env.RULE_ARN_SUBMISSION);




const submitComplain = async (req, res) => {
  try {
    const category  = req.body.department;
    const {location}  = req.body
    const citizenID = req.user.EID;
    const  subcategory  = req.body.service_name;
    const { additional_fields } = req.body;
    const { sla_value } = req.body;
    const { sla_unit } = req.body;
    const {points} = req.body;
    const {description}= req.body;
    

    const complain = new Complain({
      category,
      citizenID,
      subcategory,
      additional_fields,
      sla_value,
      sla_unit,
      points,
      location,
      description: description
    });
    //loop over additional fields to get the description
    for (const field of additional_fields) {
      if (field.field_name === "Description") {
        if(field.value.length===0){
          res.status(404).json({ error: "Error, please provide a description of the problem" });
        }
      }

    }
    console.log(complain.description)

    await complain.save();
    console.log(complain);

    const complainDetails = JSON.stringify(complain);
    console.log(complainDetails)

    // Send the event to EventBridge
    await sendToEventBridge(complain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted","submit-ticket");
    res.json(complain);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Complaint submission failed, please try again" });
  }
};

const updateComplainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    

    let updatedComplain = await Complain.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    
    if(status==="RESOLVED"){
      updatedComplain.resolutionTime = (updatedComplain.updatedAt-updatedComplain.createdAt)/ (1000 * 60 * 60);
    }

    updatedComplain.save();


    if (!updatedComplain) {
      return res.status(404).json({ error: "Error: Complain not found" });
    }
  const result = await Complain.findById(updatedComplain._id)

  // Send the event to EventBridge
  await sendToEventBridge(updatedComplain, process.env.RULE_ARN_UPDATE, "appRequestUpdated","update-ticket");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Updating Complaint status failed" });
  }
};

const getAllComplain = async (req, res) => {
  try {
    // Fetch complaints that have isExceeded=true and status=OPEN first
    const complaints = await Complain.find({
      isExceeded: true,
      status: 'OPEN',
    });

    // Fetch other complaints
    const otherComplaints = await Complain.find({
      isExceeded: { $ne: true },

    });

    // Concatenate the arrays to have isExceeded=true and status=OPEN first
    const allComplaints = complaints.concat(otherComplaints);

    if (!allComplaints) {
      return res.status(404).json({ error: "Error loading complaints" });
    }

    res.json(allComplaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};


const getComplain = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const complain = await Complain.findById(id);

    if (!complain) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(complain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaint" });
  }
};
const getComplainByDate = async (req, res) => {
  try {
    const { id } = req.user.EID;
    const { date } = req.body;

    const complaints = await Complain.find({
      citizenId: id,
      $expr: {
        $regexMatch: {
          input: { $toString: "$createdAt" },
          regex: date,
          options: "i",
        },
      },
    });

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ error: "Complaints not found for the given citizen ID and date substring" });
    }

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};

const getComplainByDateAndSubcategory = async (req, res) => {
  try {
    const { id } = req.user.EID;
    const { date } = req.body;
    const {subcategory}=req.body

    const complaints = await Complain.find({
      citizenId: id,
      subcategory,
      $expr: {
        $regexMatch: {
          input: { $toString: "$createdAt" },
          regex: date,
          options: "i",
        },
      },
    });

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ error: "Complaints not found for the given citizen ID and date substring" });
    }

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};


const getInProgressComplains = async (req, res) => {
  try {
    const complains = await Complain.find({ status: 'IN_PROGRESS' });

    if (!complains) {
      return res.status(404).json({ error: "Error loading in progress complaints" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading in progress complaints" });
  }
};



const filterAndSortTickets = async (req, res) => {
  try {
    let searchString = req.params.searchString;
    const assignedTo = req.body.assignedTo;

    if (searchString.length === 0) {
      return res.status(404).json({ error: "Error: search string can't be empty " });
    }

    // Make the searchString case-insensitive in the regex
    searchString = new RegExp(searchString, 'i');

    const tickets = await Complain.aggregate([
      {
        $match: {
          $or: [
            { category: { $regex: searchString } },
            { subcategory: { $regex: searchString } },
            { status: { $regex: searchString } },
          ],
          assignedTo: assignedTo, // Add this condition
        },
      },
      {
        $addFields: {
          customStatusOrder: {
            $switch: {
              branches: [
                { case: { $eq: [{ $toLower: "$status" }, "open"] }, then: 1 },
                { case: { $eq: [{ $toLower: "$status" }, "viewed_by_staff"] }, then: 2 },
                { case: { $eq: [{ $toLower: "$status" }, "assigned_to_concerned_department"] }, then: 3 },
                { case: { $eq: [{ $toLower: "$status" }, "canceled"] }, then: 4 },
                { case: { $eq: [{ $toLower: "$status" }, "resolved"] }, then: 5 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $sort: {
          customStatusOrder: 1,
          createdAt: -1,
        },
      },
    ]);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "Error: No complaints found" });
    }

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error loading or filtering complaints' });
  }
};


const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const { Rate } = req.body;
console.log("rate:", Rate);
console.log("feedback:", feedback);
let updatedComplain = await Complain.findOne({ _id: id });

    if (!updatedComplain) {
      console.log("Complain not found")
      return res.status(404).json({ error: "Error: Complain not found" });
    }
    if(feedback.length===0){
      return res.status(404).json({ error: "Error: Feedback can't be empty" });
    }
    if(!Rate){
      return res.status(404).json({ error: "Error: Rate can't be empty" });
    }

    if (updatedComplain.status !== "RESOLVED") {
      return res.status(404).json({ error: "Error: Complain not resolved yet" });
    }

    updatedComplain = await Complain.findByIdAndUpdate(
      id,
      { feedback, Rate },
      { new: true }
    );

  const result = await Complain.findById(updatedComplain._id)
  console.log(updatedComplain)
  const complainDetails = JSON.stringify(updatedComplain);
  console.log(complainDetails)

  // Send the event to EventBridge
   await sendToEventBridge(updatedComplain, process.env.RULE_ARN_FEEDBACK, "appRequestUpdated","feedback");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding feedback" }); 
  }
};

const checkSlaComplain = async (req, res) => {
  console.log("inside check sla");
  try {
    // Fetch all requests from the database
    const complains = await Complain.find();
    //console.log("requests..........................");
    //console.log(requests);

    if(!complains){
      return res.status(404).json({ error: "Error: No complaints found" });
    }

    // Check SLA for each request
    for (const complain of complains) {
      if (complain.status === "IN_PROGRESS" || complain.status === "OPEN") {
        const createdTime = new Date(complain.createdAt); // Parse the createdAt field
        const currentTime = new Date();
        const slaTime = complain.sla_value;
        const slaUnit = complain.sla_unit;

        let slaMultiplier = 1; // Default multiplier is 1 (hours)

        // Check the unit of SLA
        if (slaUnit === 'Days') {
          slaMultiplier = 24; // Convert days to hours
        }

        const timeDifference = currentTime - createdTime;

        if (timeDifference > slaTime * slaMultiplier * 60 * 60 * 1000) {
          // Convert SLA time to milliseconds
          // SLA exceeded, send to SQS
          complain.isExceeded = true;
          complain.save();
          const exceededComplain = {
            complain: complain,
            slaExceededTime: timeDifference / (slaMultiplier * 60 * 60 * 1000), // Convert to hours
            // Add other relevant fields from the request
          };
          console.log(exceededComplain);
          // Send to EventBridge
          await sendToEventBridge(exceededComplain, process.env.RULE_ARN_CHECKSLA_COMPLAIN, "appComplainExceeded", "checkSla-request");
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error: checking sla for complaints failed" }); 
  }
};

const getOpenedComplaintsWithCategory = async (req, res) => {
  try {
    const complains = await Complain.aggregate([
      {
        $match: {
          status: "OPEN",
          category: req.body.category,
        },
      },
    ]);

    if(!complains){
      return res.status(404).json({ error: "Error: No open complaints found for this category" });
    }

    const filteredComplains = complains.filter(complain => !complain.assignedTo);
    if (filteredComplains.length === 0) {
      return res.status(200).json({ error: `No new complaints of ${req.body.category} category` });
    }

    res.json(filteredComplains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};

const assignComplaintToStaff = async (req, res) => {
   try{
    const  minTicketID  = req.body.minTicketID;
    const minStaffID  = req.body.minStaffID;
    

    let updatedComplain = await Complain.findById({_id:minTicketID});

    

    if (!updatedComplain) {
      return res.status(404).json({ error: "Error: Complain not found" });
    }

    if(updatedComplain.assignedTo){
      return res.status(404).json({ error: "Error: Complain already assigned" });
    }

    if (updatedComplain.status !== "OPEN") {
      return res.status(404).json({ error: "Error: Complain already being processed" });
    }

    updatedComplain = await Complain.findByIdAndUpdate(
      {_id: minTicketID},
      { assignedTo: minStaffID },
      { new: true }
    );

    res.json(updatedComplain);
   }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error assigning complaint to staff member" });
    }
};

const getTicketWithStaffID = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complains = await Complain.find({ assignedTo: assignedTo });

    if (!complains) {
      return res.status(404).json({ error: "Error loading complaints" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};

const getComplaintsWithIdandViewedByStaff = async (req, res) => {
  try {
    const complains = await Complain.aggregate([
      {
        $match: {
          status: "VIEWED_BY_STAFF",
          assignedTo: req.body.assignedTo,
        },
      },
    ]);

    if (!complains) {
      return res.status(404).json({ error: "Error: No complaints found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};

const getComplaintsWithIdandOpen = async (req, res) => {
  try {
    const complains = await Complain.aggregate([
      {
        $match: {
          status: "OPEN",
          assignedTo: req.body.assignedTo,
        },
      },
    ]);

    if (!complains) {
      return res.status(404).json({ error: "Error: No complaints found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading complaints" });
  }
};
  


module.exports = {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains,
  addFeedback,
  getOpenedComplaintsWithCategory,
  assignComplaintToStaff,
  getComplaintsWithIdandViewedByStaff,
  getTicketWithStaffID,
  checkSlaComplain,
  getComplaintsWithIdandOpen,
  getComplainByDate,
  getComplainByDateAndSubcategory
};

