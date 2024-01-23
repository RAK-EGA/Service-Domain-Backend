const { PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { ebClient } = require("./ebClient");


const sendToEventBridge = async (newObject, ruleARN, DetailType,source) => {
  try {
    // Convert the complain object to a JSON string
    const objectDetails = JSON.stringify(newObject);

    // Modify the existing params object
    const params = {
      Entries: [
        {
          Detail: objectDetails,
          DetailType: DetailType,
          Resources: [ruleARN],
          Source: source,
        },
      ],
    };

    // Send the event to EventBridge
    console.log("Before");
    const data = await ebClient.send(new PutEventsCommand(params));
    
    //to do : check this is correct
    if (data.FailedEntryCount > 0) {
      console.log("Failed to send event to EventBridge");
      data.Entries.forEach((entry) => {
        if (entry.ErrorCode && entry.ErrorMessage) {
          console.log(`[${entry.ErrorCode}] ${entry.ErrorMessage}`);
        }
      });
    }

    console.log("after");
    return data;
  } catch (err) {
    return err;
  }
};

module.exports = { sendToEventBridge };
