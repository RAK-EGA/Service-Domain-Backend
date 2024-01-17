// const updateTicketStatus = async (req, res,Model,rule,source) => {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;
  
//       const updatedTicket = await Model.findByIdAndUpdate(
//         id,
  
//         { status },
//         { new: true }
//       );
      
//       if (!updatedTicket) {
//         return res.status(404).json({ error: `${Model} not found`});
//       }
//     const result = await Complain.findById(updatedTicket._id)
//     console.log(updatedTicket)
//     const ticketDetails = JSON.stringify(updatedTicket);
//     console.log(ticketDetails)
  
//     // Send the event to EventBridge
//     await sendToEventBridge(updatedTicket, rule, `app${Model}Updated`,source);
//       res.json(result);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   };




//   module.exports = {
//     updateTicketStatus,
// }