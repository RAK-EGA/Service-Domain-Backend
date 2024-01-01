// ebClient.js

const { EventBridgeClient } = require("@aws-sdk/client-eventbridge");

const createEventBridgeClient = (ruleARN) => {
  // Set the AWS Region.
  const REGION = process.env.REGION;

  // Create an Amazon EventBridge service client object.
  const ebClient = new EventBridgeClient({ region: REGION });

  return ebClient;
};

module.exports = { createEventBridgeClient };

