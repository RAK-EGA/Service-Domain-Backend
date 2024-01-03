const Request = require("../model/Request.js");
const axios = require('axios');


const submitRequest = async (req, res) => {
    try {
      const { serviceDetails } = req.body;
  
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
              const aiResponse = await axios.post('http://rakmun-api.rakega.online/read', {
                value: field.value,
                documentType: field.field_name//@todo make sure field name is correct"
              });
  
              // Update the "fields" attribute with the AI response
              field.fields = aiResponse.data;
            } catch (aiError) {
              console.error(aiError);
              return res.status(500).json({ error: "Error fetching document fields from external API." });
            }
          }
        }
      }
  
      // Continue with the rest of your request submission logic
  
      // ...
  
      res.json({ success: true, message: "Request submitted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  
module.exports = {
    submitRequest,
}