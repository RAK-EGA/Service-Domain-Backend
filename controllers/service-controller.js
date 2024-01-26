
const Service = require("../model/Service.js");
const axios = require('axios');
const { getAllKeys, getCache } = require("../clients/redisClient");

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
                    const { description } = service;
                    // console.log(service.service_id)
                    const additional_fields = service.additional_fields;
                    console.log(service.description)
                    // Create a new Mongoose document
                    const serviceDocument = new Service({
                        service_name : service_name ,
                        additional_fields,
                        sla_value: service.sla_value,
                        sla_unit: service.sla_unit,
                        service_type: service.service_type,
                        description : description,
                        points: service.points,
                        department: service.department,
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

//done
const getRequestsNames = async (req, res) => {
  try {
    // Get all keys from Redis
    const allKeys = await getAllKeys();

    // Filter keys that represent requests
    const requestKeys = allKeys.filter((key) => key.startsWith("Request:"));

    // Extract the names from the third item when splitting by ":"
    const requestNames = requestKeys.map((key) => key.split(":")[2]);

    // Send the request names in the response body
    res.json({ requestNames });
  } catch (error) {
    res.status(500).json({ error: 'Error getting requests names' });
  }
};

//done
const getComplainsNames = async (req, res) => {
  try {
    // Get all keys from Redis
    const allKeys = await getAllKeys();

    // Filter keys that represent Complaint
    const ComplaintKeys = allKeys.filter((key) => key.startsWith("Complaint:"));

    // Extract the names from the third item when splitting by ":"
    const ComplaintNames = ComplaintKeys.map((key) => key.split(":")[2]);

    // Send the Complaint names in the response body
    res.json({ ComplaintNames });
  } catch (error) {
    res.status(500).json({ error: 'Error getting Complaint names' });
  }
  };

//done
const getCategories = async (req, res) => {
  try {
    // Get all keys from Redis
    const allKeys = await getAllKeys();

    // Filter keys that represent complaints
    const complaintKeys = allKeys.filter((key) => key.startsWith("Complaint:"));

    // Extract the department names from the second item when splitting by ":"
    const departmentNames = Array.from(new Set(complaintKeys.map((key) => key.split(":")[1])));

    // Send the department names in the response body
    res.json({ departmentNames });
  } catch (error) {
    res.status(500).json({ error: 'Error getting department names' });
  }
};

const getSubCategories = async (req, res) => {
  try {
    const { department } = req.params;
    //get all complains with the same department
    const allComplains = await Service.find( {  service_type: "Complaint", department: department});
    //get all subcategories
    const subcategories = Array.from(new Set(allComplains.map(complain => complain.service_name)));
    res.json({ subcategories });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};  


const getAllCacheKeys = async (req, res) => {
  try {
    const keys = await getAllKeys();
    res.json({ keys });
  } catch (error) {
    console.error('Error getting all cache keys:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
    oneTimeJob,
    getServiceByName,
    getRequestsNames,
    getComplainsNames,
    getCategories,
    getSubCategories,
    getAllCacheKeys,
}