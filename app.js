// import express from 'express';
const express = require('express');
const { default: mongoose } = require('mongoose');
const env=require('dotenv').config();
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");
const complainRouter = require('./routes/complain-router.js');
 
const app = express();
const port= process.env.port
app.use(express.json());
 
app.use("/service/complaint", complainRouter);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Staff APIs Documentation",
            version: "0.1",
        },
        servers: [
            {
                url: `http://localhost:${process.env.port}/`,
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