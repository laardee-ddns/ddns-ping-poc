'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_DEFAULT_REGION });

const uuidV4 = require('uuid/v4')
const token = uuidV4();

const user = 'temp-user-id';

if (typeof process.argv[2] !== 'string') {
  console.log('You must specify a record name');
  process.exit(1);
}

async function createRecord(token, record, user) {
  return dynamo.put({
    TableName: process.env.RECORDS_TABLE_NAME,
    Item: {
      token,
      expires: Date.now() + (7 * 24 * 60 * 60), // in 7 days if no activity
      record,
      user,
      enabled: true,
    }
  }).promise();
}
console.log(process.argv[2], token);

createRecord(token, process.argv[2], user);
