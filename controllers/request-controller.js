const Request = require("../model/Request.js");
const axios = require('axios');

const oneTimeJob = async (req, res) => {
    
    const instance = await Request.find();
    if (instance.length == 0 || !instance || instance == null) {
        try {
            const response = await axios.get('https://rakmun-api.rakega.online/servicecatalog/get-all-services/');
    
            // Access the data from the response
            const responseData = response.data;/////////////////////////loooooooooooooooooooop
            // const serviceID = responseData.data.serviceID;
            for (const service of responseData) {
                try {
                    const serviceeID = service.service_name;
                    // console.log(service.service_id)
                    const serviceDetails = service;
                    console.log(service)
                    if (serviceDetails.points != 0) {
                        continue
                    }
                    // Create a new Mongoose document
                    const requestDocument = new Request({
                        serviceName : serviceeID ,
                        serviceDetails,
                    });
    
    
                    // Save the document to the "requests" collection
                    await requestDocument.save();
    
                    // console.log(`Saved: ${serviceID}`);
                } catch (error) {
                    console.error(`Error saving document: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
        res.status(201).json({ message: "this job has been executed successfully" });
    } else {
        res.status(400).json({ message: "this job has already been done" });
    }
}

const submitRequest = async (req, res) => {
    try {
      const {
        category,
        subcategory,
        description,
        imageAttachment,
        complainName,
        voiceRecordAttachment,
        citizenID,
        token
      } = req.body;
  
        const customerMeResponse = await axios.get(
          'https://rakmun-api.rakega.online/customer/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              // Add any other headers if needed
            },
          }
        );
        
        // Handle the response here
        // console.log(customerMeResponse.data);
       
      // Check if the customerMeResponse indicates success based on your API response structure
      if (customerMeResponse.data.success) {
        // If successful, proceed to save the new complain
        const newComplain = new Complain({
          category,
          subcategory,
          description,
          imageAttachment,
          complainName,
          voiceRecordAttachment,
          citizenID,
        });
  
        newComplain.citizenID = customerMeResponse.data.data.user.EID;
        console.log("this eid")
        console.log(customerMeResponse.data.data.user.EID)
        
        await newComplain.save();
  
        newComplain.complainName = `${category}_${newComplain._id}`;
  
        // Save the newComplain again to update the complainName
        await newComplain.save();
  
        const complainDetails = JSON.stringify(newComplain);
  
        // Send the event to EventBridge
        await sendToEventBridge(newComplain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted");
  
        res.json(newComplain);
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Failed to authenticate with customer service" });
    }
  };

module.exports = {
    oneTimeJob,
}