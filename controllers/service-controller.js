
const Service = require("../model/Service.js");
const axios = require('axios');

const oneTimeJob = async (req, res) => {
    
    const instance = await Service.find();
    if (instance.length == 0 || !instance || instance == null) {
        try {
            const response = await axios.get('https://rakmun-api.rakega.online/servicecatalog/get-all-services/');
    
            // Access the data from the response
            const responseData = response.data;/////////////////////////loooooooooooooooooooop
            // const serviceID = responseData.data.serviceID;
            for (const service of responseData) {
                try {
                    const service_name = service.service_name;
                    // console.log(service.service_id)
                    const additional_fields = service.additional_fields;
                    console.log(service)
                    // Create a new Mongoose document
                    const serviceDocument = new Service({
                        service_name : service_name ,
                        additional_fields,
                        sla_value: service.sla_value,
                        sla_unit: service.sla_unit,
                        service_type: service.service_type,
                        points: service.points,
                    });
    
    
                    // Save the document to the "requests" collection
                    await serviceDocument.save();
    
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

const getServiceByName = async (req, res) => {
  try {
    // Retrieve serviceName from the request params
    const { service_name } = req.params;

    // Query the database to find the service with the specified name
    const service = await Service.findOne({ service_name });

    // Check if the service was found
    if (service) {
      // Send the service details in the response body
      res.json(service);
    } else {
      // If service is not found, return an appropriate response
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  const getRequestsNames = async (req, res) => {
    try {
      // Query the database to get all documents
      const allRequests = await Service.find({ service_type: "Request" });
      
      // Extract unique service names
      const serviceNames = Array.from(new Set(allRequests.map(request => request.service_name)));
      // console.log(serviceNames);
      // Send the service names in the response body
      res.json({ serviceNames });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getComplainsNames = async (req, res) => {
    try {
      // Query the database to get all documents
      const allRequests = await Service.find( {  service_type: "Complaint"});
      
      // Extract unique service names
      const serviceNames = Array.from(new Set(allRequests.map(request => request.service_name)));
      // console.log(serviceNames);
      // Send the service names in the response body
      res.json({ serviceNames });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


module.exports = {
    oneTimeJob,
    getServiceByName,
    getRequestsNames,
    getComplainsNames,
}