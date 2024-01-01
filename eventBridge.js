const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");

const sendToEventBridge = async (newComplain, ruleARN, ebClient, DetailType) => {
  try {
    // Convert the complain object to a JSON string
    const complainDetails = JSON.stringify(newComplain);

    // Modify the existing params object
    const params = {
      Entries: [
        {
          Detail: complainDetails,
          DetailType: DetailType,
          Resources: [ruleARN],
          Source: "ticket",
        },
      ],
    };

    // Send the event to EventBridge
    const data = await ebClient.send(new PutEventsCommand(params));
    return data;
  } catch (err) {
    return err;
  }
};

module.exports = { sendToEventBridge };
