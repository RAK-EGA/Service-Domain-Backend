
const axios = require('axios');
const Complain = require("../model/Complain");

const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { createEventBridgeClient } = require("../ebClient");
const {sendToEventBridge} = require('../eventBridge.js')
//const ebClientUpdate = createEventBridgeClient(process.env.RULE_ARN_UPDATE);
//const ebClientSubmission = createEventBridgeClient(process.env.RULE_ARN_SUBMISSION);




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
    } = req.body;

      
      
      // Handle the response here
      // console.log(customerMeResponse.data);
     
    // Check if the customerMeResponse indicates success based on your API response structure

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

      
      newComplain.citizenID = req.user.EID;
      
      await newComplain.save();

      newComplain.complainName = `${category}_${newComplain._id}`;

      // Save the newComplain again to update the complainName
      await newComplain.save();


      // Send the event to EventBridge
      await sendToEventBridge(newComplain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted","submit-ticket");

      res.json(newComplain);
    
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to authenticate with customer service" });
  }
};

const updateComplainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedComplain = await Complain.findByIdAndUpdate(
      id,

      { status },
      { new: true }
    );
    
    if (!updatedComplain) {
      return res.status(404).json({ error: "Complain not found" });
    }
  const result = await Complain.findById(updatedComplain._id)
  console.log(updatedComplain)
  const complainDetails = JSON.stringify(updatedComplain);
  console.log(complainDetails)

  // Send the event to EventBridge
  await sendToEventBridge(updatedComplain, process.env.RULE_ARN_UPDATE, "appRequestUpdated","update-ticket");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllComplain = async (req, res) => {
  try {
    const { id } = req.params;
    const complain = await Complain.find();

    if (!complain) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(complain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getComplain = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const complain = await Complain.findById(id);

    if (!complain) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(complain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInProgressComplains = async (req, res) => {
  try {
    const complains = await Complain.find({ status: 'IN_PROGRESS' });

    if (complains.length === 0) {
      return res.status(404).json({ error: "No complaints in progress found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getComplainsByCitizen = async (req, res) => {
  try {
    const { citizenID } = req.params;
    if (!citizenID) {
      return res.status(400).json({ error: "Citizen ID is required" });
    }

    const complains = await Complain.find({ citizenID: citizenID });

    if (complains.length === 0) {
      return res.status(404).json({ error: "No complaints found for the specified citizen" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterAndSortTickets = async (req, res) => {
  try {
    let searchString = req.params.searchString;

    // const regex = new RegExp(searchString, 'i');
    searchString = searchString.replace(/(\r\n|\n|\r)/gm, "");

    const tickets = await Complain.aggregate([
      {
        $match: {
          $or: [
            { category: { $regex: searchString } },
            { subcategory: { $regex: searchString } },
            { status: { $regex: searchString } },
          ],
        },
      },
      {
        $addFields: {
          customStatusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "OPEN"] }, then: 1 },
                { case: { $eq: ["$status", "VIEWED_BY_STAFF"] }, then: 2 },
                { case: { $eq: ["$status", "ASSIGNED_TO_CONCERNED_DEPARTMENT"] }, then: 3 },
                { case: { $eq: ["$status", "CANCELED"] }, then: 4 },
                { case: { $eq: ["$status", "RESOLVED"] }, then: 5 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $sort: {
          customStatusOrder: 1,
          createdAt: -1,
        },
      },
    ]);
    
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const { Rate } = req.body;

    let updatedComplain = await Complain.findOne({ _id: id });

    if (!updatedComplain) {
      console.log("Complain not found")
      return res.status(404).json({ error: "Complain not found" });
    }

    if (updatedComplain.status !== "RESOLVED") {
      return res.status(404).json({ error: "Complain not resolved yet" });
    }

    updatedComplain = await Complain.findByIdAndUpdate(
      id,
      { feedback, Rate },
      { new: true }
    );

  const result = await Complain.findById(updatedComplain._id)
  console.log(updatedComplain)
  const complainDetails = JSON.stringify(updatedComplain);
  console.log(complainDetails)

  // Send the event to EventBridge
  // await sendToEventBridge(updatedComplain, process.env.RULE_ARN_FEEDBACK, "appRequestUpdated","feedback");
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); 
  }
};

const getOpenedComplaintsWithCategory = async (req, res) => {
  try {
    const complains = await Complain.aggregate([
      {
        $match: {
          status: "OPEN",
          category: req.body.category,
        },
      },
    ]);

    if (complains.length === 0) {
      return res.status(404).json({ error: "No complaints found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const assignComplaintToStaff = async (req, res) => {
   try{
    const { id } = req.body;
    const { assignedTo } = req.body;

    let updatedComplain = await Complain.findOne({ _id: id });

    if (!updatedComplain) {
      return res.status(404).json({ error: "Complain not found" });
    }

    if(updatedComplain.assignedTo){
      return res.status(404).json({ error: "Complain already assigned" });
    }

    if (updatedComplain.status !== "OPEN") {
      return res.status(404).json({ error: "Complain already being processed" });
    }

    updatedComplain = await Complain.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    );

    res.json(updatedComplain);
   }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};

const getTicketWithStaffID = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complains = await Complain.find({ assignedTo: assignedTo });

    if (!complains) {
      return res.status(404).json({ error: "Complain not found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getComplaintsWithIdandViewedByStaff = async (req, res) => {
  try {
    const complains = await Complain.aggregate([
      {
        $match: {
          status: "VIEWED_BY_STAFF",
          assignedTo: req.body.assignedTo,
        },
      },
    ]);

    if (complains.length === 0) {
      return res.status(404).json({ error: "No complaints found" });
    }

    res.json(complains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains,
  getComplainsByCitizen,
  addFeedback,
  getOpenedComplaintsWithCategory,
  assignComplaintToStaff,
  getComplaintsWithIdandViewedByStaff,
  getTicketWithStaffID,
};
