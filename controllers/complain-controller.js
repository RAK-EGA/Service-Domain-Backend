
const axios = require('axios');
const Complain = require("../model/Complain");

const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { createEventBridgeClient } = require("../ebClient");
const {sendToEventBridge} = require('../eventBridge.js')
//const ebClientUpdate = createEventBridgeClient(process.env.RULE_ARN_UPDATE);
//const ebClientSubmission = createEventBridgeClient(process.env.RULE_ARN_SUBMISSION);




const submitComplain = async (req, res) => {
  try {
    const category  = req.body.department;
    const citizenID = req.user.EID;
    const  subcategory  = req.body.service_name;
    const { additional_fields } = req.body;
    const { sla_value } = req.body;
    const { sla_unit } = req.body;
    const {points} = req.body;
    

    const complain = new Complain({
      category,
      citizenID: citizenID,
      subcategory,
      additional_fields,
      sla_value,
      sla_unit,
      points,
      description: "",
    });

    //loop over additional fields to get the description
    for (const field of additional_fields) {
      if (field.field_name === "Description") {
        if(field.value.length>0)
          complain.description = field.value;
      }
    }
    console.log(complain.description)

    const savedComplain = await complain.save();

    const complainDetails = JSON.stringify(savedComplain);
    console.log(complainDetails)

    // Send the event to EventBridge
    await sendToEventBridge(savedComplain, process.env.RULE_ARN_SUBMISSION, "appRequestSubmitted","submit-ticket");
    res.json(savedComplain);
    
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

    // Make the searchString case-insensitive in the regex
    searchString = new RegExp(searchString, 'i');

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
                { case: { $eq: [{ $toLower: "$status" }, "open"] }, then: 1 },
                { case: { $eq: [{ $toLower: "$status" }, "viewed_by_staff"] }, then: 2 },
                { case: { $eq: [{ $toLower: "$status" }, "assigned_to_concerned_department"] }, then: 3 },
                { case: { $eq: [{ $toLower: "$status" }, "canceled"] }, then: 4 },
                { case: { $eq: [{ $toLower: "$status" }, "resolved"] }, then: 5 },
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

