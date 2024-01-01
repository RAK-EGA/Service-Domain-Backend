const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { ebClient } = require("./ebClient");

const sendToEventBridge = async (newComplain,ruleARN) => {
  try {
    // Convert the complain object to a JSON string
    const complainDetails = JSON.stringify(newComplain);

    // Modify the existing params object
    const params = {
      Entries: [
        {
          Detail: complainDetails,
          DetailType: "appRequestSubmitted",
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
