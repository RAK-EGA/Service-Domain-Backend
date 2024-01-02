const axios = require('axios');

const submitComplain = async (req, res) => {
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

    // Send a request to "http://rakmun-api.rakega.online/customer/me" with the received token
    const customerMeResponse = await axios.post('http://rakmun-api.rakega.online/customer/me', {
      token,
    });

    // Check if the customerMeResponse indicates success based on your API response structure
    if (customerMeResponse.success) {
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

      await newComplain.save();

      newComplain.complainName = `${category}_${newComplain._id}`;

      // Save the newComplain again to update the complainName
      await newComplain.save();

      const complainDetails = JSON.stringify(newComplain);

      // Send the event to EventBridge
      await sendToEventBridge(newComplain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted");

      res.json(newComplain);
    } else {
      // Handle the case where the request to "http://rakmun-api.rakega.online/customer/me" failed
      res.status(400).json({ error: "Failed to authenticate with customer service" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const submitComplain = async (req, res) => {
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
  
      const newComplain = new Complain({
        category,
        subcategory,
        description,
        imageAttachment,
        complainName,
        voiceRecordAttachment,
        citizenID,
      });
  
  
      //here I want to send the token I recieve from the body to this endpoint "http://rakmun-api.rakega.online/customer/me" in the body
      // of the request 
       // Send a request to "http://rakmun-api.rakega.online/customer/me" with the received token
       const customerMeResponse = await axios.post('http://rakmun-api.rakega.online/customer/me', {
        token,
      });
      await newComplain.save();
  
      newComplain.complainName = `${category}_${newComplain._id}`;
      
      // Save the newComplain again to update the complainName
      await newComplain.save();
      const complainDetails = JSON.stringify(newComplain);
  
      
  
      // Send the event to EventBridge
      await sendToEventBridge(newComplain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted");
  
      res.json(newComplain);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };