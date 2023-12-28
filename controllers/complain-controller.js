const Complain = require("../model/Complain");

const submitComplain = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      description,
      imageAttachment,
      complainName,
      voiceRecordAttachment,
    } = req.body;

    const newComplain = new Complain({
      category,
      subcategory,
      description,
      imageAttachment,
      complainName,
      voiceRecordAttachment,
    });
    await newComplain.save();

    newComplain.complainName = `${category}_${newComplain._id}`;
    
    // Save the newComplain again to update the complainName
    await newComplain.save();

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
    // updatedComplain.complainName= category + id;
    if (!updatedComplain) {
      return res.status(404).json({ error: "Complain not found" });
    }
const result = await Complain.findById(updatedComplain._id)

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
  getInProgressComplains
};
