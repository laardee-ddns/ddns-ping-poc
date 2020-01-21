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
  const exists = await dynamo.query({
    TableName: process.env.RECORDS_TABLE_NAME,
    IndexName: 'record',
    KeyConditionExpression: '#record = :record',
    ExpressionAttributeNames: {
      '#record': 'record'
    },
    ExpressionAttributeValues: {
      ':record': record,
    },
  }).promise().then(({ Items }) => Items.length > 0);
  if (exists === false) {
    await dynamo.put({
      TableName: process.env.RECORDS_TABLE_NAME,
      Item: {
        token,
        expires: Date.now() + (7 * 24 * 60 * 60), // in 7 days if no activity
        record,
        user,
        enabled: true,
      }
    }).promise();
    return `${record} created with token ${token}`;
  }
  return `${record} already exists`;
}

createRecord(token, process.argv[2], user).then(console.log);
