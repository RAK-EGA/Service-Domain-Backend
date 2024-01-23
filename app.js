// import express from 'express';
const express = require('express');
const { default: mongoose } = require('mongoose');
const env=require('dotenv').config();
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");
const complainRouter = require('./routes/complain-router.js');
const cors = require('cors');
const { sendToEventBridge } = require('./eventBridge.js');
const { checkSla  } = require('./controllers/request-controller.js');
const {checkSlaComplain} = require('./controllers/complain-controller.js')
const cron = require('node-cron');
const Service = require("./model/Service.js");
const servicerouter = require('./routes/services-router.js');
const requestrouter = require('./routes/request-router.js');
const axios = require("axios");

 
const app = express();

// console.log("Before");
// sendToEventBridge({"key1": "value1"}, process.env.RULE_ARN_SUBMISSION , "empty")
// console.log("After")


const port= process.env.port
app.use(express.json());
app.use(cors());
app.options('*', cors());


app.use("/service/complaint" ,complainRouter);
app.use("/service/service", servicerouter);
app.use("/service/request", requestrouter);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Staff APIs Documentation",
            version: "0.1",
        },
        servers: [
            {
                url: `http://rakmun-api.rakega.online/service/complaint`,
            }
        ]
    },
    apis: ["./routes/complain-router.js"],
};
 
 
const spacs = swaggerjsdoc(options);
app.use(
    "/api-docs",
    swaggerui.serve,
    swaggerui.setup(spacs)
);
 

cron.schedule('* * * * *', async () => {
    try {
      await checkSlaComplain();
      console.log('checkSla executed successfully.');
    } catch (error) {
      console.error('Error executing checkSla:', error);
    }
  });
cron.schedule('* * * * *', async () => {
    try {
      await checkSla();
      console.log('checkSla executed successfully.');
    } catch (error) {
      console.error('Error executing checkSla:', error.stack);
    }
  });  

mongoose
    .connect(
        'mongodb+srv://YaraSamy:Service123456@cluster0.71gqs0y.mongodb.net/?retryWrites=true&w=majority'
    )
    .then(
        ()=> app.listen(port)
    )
    .then(
        ()=> console.log(`Connected to DB, should be exposed at: ${port}`), 
    )
    .catch(
        (err)=> console.log(err)
    );

// Define the cron job
// const cronJob = cron.schedule('* * * * *', async () => {
//     console.log('Running cron job...');
//     // Loop through the JSON array and save each document to the "requests" collection
//     for (const service of jsonData) {
//       try {
//         // Extract information from the JSON object
//         const serviceID = service.service_id;
//         const serviceDetails = service;
//         if(serviceDetails.points!=0){
//             continue
//         }
//         // Create a new Mongoose document
//         const requestDocument = new Request({
//           serviceID,
//           serviceDetails,
//         });
        
  
//         // Save the document to the "requests" collection
//         // await requestDocument.save();
  
//         // console.log(`Saved: ${serviceID}`);
//       } catch (error) {
//         console.error(`Error saving document: ${error.message}`);
//       }
//     }
//   }, { scheduled: false, timezone: 'Africa/Cairo' });  // Set your timezone
  
//   // Run the cron job once
//   cronJob.start();
  
