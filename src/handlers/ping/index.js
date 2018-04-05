'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({ region: process.env.SERVERLESS_REGION });

module.exports.handler = async (event, context, callback) => {
  const params = {
    TableName: process.env.RECORDS_TABLE_NAME,
    Key: { token : event.pathParameters.token },
    UpdateExpression: 'set #ip=:ip, #requestTime=:requestTime',
    ConditionExpression: '#ip<>:ip',
    ExpressionAttributeNames: {
      '#ip': 'ip',
      '#requestTime': 'requestTime',
    },
    ExpressionAttributeValues: {
      ':ip': event.requestContext.identity.sourceIp,
      ':requestTime': event.requestContext.requestTimeEpoch,
    }
  };
  let updated = false;
  try {
    await dynamo.update(params).promise();
    updated = true;
  } catch (exception) {
    console.log(exception);
  }

  console.log({ updated });

  const response = {
    statusCode: 200,
    body: JSON.stringify({message: 'ok'}),
  };

  return callback(null, response);
};
