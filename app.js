// import express from 'express';
const express = require('express');
const { default: mongoose } = require('mongoose');
const env=require('dotenv').config();
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");
const complainRouter = require('./routes/complain-router.js');
const cors = require('cors');
const { sendToEventBridge } = require('./eventBridge.js');
const cron = require('node-cron');
const Request = require("./model/Request.js");
const requestrouter = require('./routes/requests-router.js');
 
const app = express();

// console.log("Before");
// sendToEventBridge({"key1": "value1"}, process.env.RULE_ARN_SUBMISSION , "empty")
// console.log("After")


const port= process.env.port
app.use(express.json());
app.use(cors());
app.options('*', cors());


const jsonData = 
[
    {
        "service_id": "SV01",
        "additional_fields": [
            {
                "field_name": "Scanned Image of Passport",
                "field_type": "document",
                "is_required": true,
                "is_ai_compatible": true
            },
            {
                "condition": {
                    "condition_type": "selection",
                    "values": [
                        "UAE",
                        "EGY"
                    ]
                },
                "field_name": "Nationality",
                "field_type": "text",
                "is_required": true,
                "is_ai_compatible": false
            },
            {
                "condition": {
                    "condition_type": "min-max",
                    "values": [
                        18,
                        120
                    ]
                },
                "field_name": "Age",
                "field_type": "meta",
                "is_required": false,
                "is_ai_compatible": false
            }
        ],
        "service_name": "Plot Request",
        "service_type": "Request",
        "department": "Housing",
        "sla_value": 30,
        "sla_unit": "Days",
        "description": "This application allows the issuance of a residential plot under the approval of Emiri Diwan \nThe applicant must meet the following conditions to get approval: \n-Meets the Legal Age \n-UAE or EGY Citizenship",
        "points": 0
    },
    {
        "service_id": "SV02",
        "additional_fields": [],
        "service_name": "Power Outage",
        "service_type": "Complaint",
        "department": "Electricity",
        "sla_value": 1,
        "sla_unit": "Hour",
        "description": "This service allows citizens to submit complaints regarding power outages in their area",
        "points": 50
    },
    {
        "service_id": "SV03",
        "additional_fields": [
            {
                "field_name": "Scanned Image of Passport",
                "field_type": "document",
                "is_required": true,
                "is_ai_compatible": true
            },
            {
                "field_name": "Scanned Image of  Valid Trade License",
                "field_type": "document",
                "is_required": true,
                "is_ai_compatible": false
            }
        ],
        "service_name": "Health Card Issuance",
        "service_type": "Request",
        "department": "Health",
        "sla_value": 4,
        "sla_unit": "Days",
        "description": "This application allows the issuance of Health Cards for employees of both Food & Other Public Health Establishments, to ensure that they are free from any infectious diseases before starting to work , in case of having a new employee or if the card is expired. \nThe applicant must meet the following conditions to get approval: \n- Provide a Copy of Passport \n- Provide Copy of Valid Trade License",
        "points": 0
    }
];

 
app.use("/service/complaint", complainRouter);
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
  