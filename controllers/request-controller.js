const Request = require("../model/Request.js");
const axios = require('axios');
const cron = require('node-cron');
const {sendToEventBridge} = require('../eventBridge.js')


const submitRequest = async (req, res) => {
    try {
      const { serviceDetails } = req.body;
    console.log("*******************");
    console.log(serviceDetails);
      // Parse and validate additional_fields
      if (serviceDetails && serviceDetails.additional_fields && Array.isArray(serviceDetails.additional_fields)) {
        for (const field of serviceDetails.additional_fields) {
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
              const aiResponse = await axios.post('https://rakmun-api.rakega.online/documents/read', {
                value: field.value,
                documentType: field.document_type//@todo make sure field name is correct"
              });
  
              // Update the "fields" attribute with the AI response
              field.AI_fields = aiResponse.data;
            } catch (aiError) {
              console.error(aiError);
              return res.status(500).json({ error: "Error fetching document fields from external API." });
            }
          }
        }
      }
  
      const newRequest = new Request({
        citizenID,
        serviceName,
        serviceDetails 
      });

      await newRequest.save();

  
      res.json({ success: true, message: "Request submitted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const checkSla = async() => {
      try {
        // Fetch all requests from the database
        const requests = await Request.find();
  
        // Check SLA for each request
        for (const request of requests) {
          const createdTime = request.createdAt;
          const currentTime = new Date();
          const slaTime = request.serviceDetails.sla_value;
          const timeDifference = currentTime - createdTime;
  
          if (timeDifference > slaTime * 60 * 60 * 1000) { // Convert SLA time to milliseconds
            // SLA exceeded, send to SQS
            const exceededRequest = {
              requestId: request._id,
              slaExceededTime: timeDifference / (60 * 60 * 1000), // Convert to hours
              // Add other relevant fields from the request
            };
  
            // Send to EventBridge
            await sendToEventBridge(exceededRequest, process.env.RULE_ARN_CHECKSLA, "appRequestExceeded");
          }
        }
      } catch (error) {
        console.error(error);
      }
    
  };
  
module.exports = {
    submitRequest,
    checkSla,
}