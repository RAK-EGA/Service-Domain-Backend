

const Complain = require("../model/Complain");
const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { createEventBridgeClient } = require("../ebClient");
const {sendToEventBridge} = require('../eventBridge.js')
const ebClientUpdate = createEventBridgeClient(process.env.RULE_ARN_UPDATE);
const ebClientSubmission = createEventBridgeClient(process.env.RULE_ARN_SUBMISSION);




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
    await sendToEventBridge(newComplain, process.env.RULE_ARN_SUBMISSION, ebClientSubmission, "appRequestSubmitted");

    res.json(newComplain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
  await sendToEventBridge(updatedComplain, process.env.RULE_ARN_UPDATE, ebClientUpdate, "appRequestUpdated");
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

    const regex = new RegExp(searchString, 'i');
    searchString = searchString.replace(/(\r\n|\n|\r)/gm, "");

  
    const tickets = await Complain.find({
      $and: [
        {
          $or: [
            { category: { $regex: searchString } },
            { subcategory: { $regex: searchString } },
            { complainName: { $regex: searchString } },
          ],
        },
        { status: "OPEN" }, 
      ],
    })
      .sort({ createdAt: -1 }); 

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains,
  getComplainsByCitizen
};
