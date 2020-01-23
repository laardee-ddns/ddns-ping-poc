'use strict'

const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ region: process.env.SERVERLESS_REGION })

module.exports.handler = async event => {
  const data = await dynamo
    .get({
      TableName: process.env.RECORDS_TABLE_NAME,
      Key: { token: event.pathParameters.token }
    })
    .promise()
  const exists = typeof data.Item !== 'undefined'

  let response = {
    statusCode: 404,
    body: JSON.stringify({ message: 'invalid token' })
  }

  if (exists === true) {
    const params = {
      TableName: process.env.RECORDS_TABLE_NAME,
      Key: { token: event.pathParameters.token },
      UpdateExpression: 'set #ip=:ip, #requestTime=:requestTime',
      ConditionExpression: '#ip<>:ip',
      ExpressionAttributeNames: {
        '#ip': 'ip',
        '#requestTime': 'requestTime'
      },
      ExpressionAttributeValues: {
        ':ip': event.requestContext.identity.sourceIp,
        ':requestTime': event.requestContext.requestTimeEpoch
      }
    }

    let updated = false
    try {
      const update = await dynamo.update(params).promise()
      console.log(update)
      updated = true
    } catch (exception) {
      if (exception.code !== '') {
      }
      console.log(exception)
    }

    console.log({ updated })

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: updated ? 'updated' : 'exists' })
    }
  }
  return response
}
