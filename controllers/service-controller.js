
const Service = require("../model/Service.js");
const axios = require('axios');
const { getAllKeys, getCache, setCache } = require("../clients/redisClient");

//no longer used
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



async function populateCache() {
  try {
    // Make a GET request to the API endpoint
    const response = await axios.get('https://rakmun-api.rakega.online/servicecatalog/populate-cache/');

    // Assuming the API response is an array of objects with keys and values
    const data = response.data;

    // Save each key-value pair to the cache
    for (const item of data) {
      const { key, value } = item;

      // Set the key-value pair in the cache
      await setCache(key, value);
    }

    console.log('Cache populated successfully.');
  } catch (error) {
    console.error('Error populating cache:', error.message);
    throw error; // Handle the error appropriately in your application
  }
}

//done
const getServiceByName = async (req, res) => {
  try {
    // Retrieve serviceName from the request params
    const { service_name } = req.params;
    const keys = await getAllKeys();
    const cachedServiceKey = keys.filter((key) => key.includes(service_name));

    // Check if the service is in the Redis cache
    const cachedService = await getCache(`${cachedServiceKey}`);

    if (cachedService) {
      // If the service is in the cache, return the cached value
      res.json(cachedService);
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error: service not found' });
  }
};


//done
const getRequestsNames = async (req, res) => {
  try {
    // Get all keys from Redis
    const allKeys = await getAllKeys();
    if(allKeys.length===0){
      populateCache()
    }

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
const getCategories = async (req, res) => {
  try {
    // Get all keys from Redis
    const allKeys = await getAllKeys();
    if(allKeys.length===0){
      populateCache()
    }

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
const getSubCategories = async (req, res) => {
  try {
    const { department } = req.params;

    // Get all keys from Redis
    const allKeys = await getAllKeys();

    // Filter keys that represent complaints for the specified department
    const complaintKeys = allKeys.filter((key) => key.startsWith(`Complaint:${department}:`));

    // Extract the subcategory names from the third item when splitting by ":"
    const subcategories = Array.from(new Set(complaintKeys.map((key) => key.split(":")[2])));

    // Send the subcategory names in the response body
    res.json({ subcategories });
  } catch (error) {
    res.status(500).json({ error: 'Error getting subcategories' });
  }
};
  

//new cache function
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