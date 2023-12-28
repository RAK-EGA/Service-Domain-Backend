// import express from 'express';
const express = require('express');
const { default: mongoose } = require('mongoose');
const env=require('dotenv').config();
// import mongoose from 'mongoose';
// import router from './routes/user-routes.js';
// import complainRouter from './routes/complain-router.js';
const complainRouter = require('./routes/complain-router.js');
 
const app = express();
const port= process.env.port

app.use(express.json());
 
app.use("/service/complaint", complainRouter);
 
mongoose
    .connect(
        'mongodb+srv://YaraSamy:Service123456@cluster0.71gqs0y.mongodb.net/?retryWrites=true&w=majority'
    )
    .then(
        ()=> app.listen(port)
    )
    .then(
        ()=> console.log('Connected to DB')
    )
    .catch(
        (err)=> console.log(err)
    );