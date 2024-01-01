const { EventBridgeClient } = require("@aws-sdk/client-eventbridge");
// Set the AWS Region.
const REGION = process.env.REGION;
// Create an Amazon EventBridge service client object.
const ebClient = new EventBridgeClient({ region: REGION });

module.exports = { ebClient };