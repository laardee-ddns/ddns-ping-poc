'use strict'

const AWS = require('aws-sdk')
const route53 = new AWS.Route53({ region: process.env.SERVERLESS_REGION })

module.exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2))
  if (typeof event.Records !== 'undefined' && typeof event.Records[0] !== 'undefined') {
    if (
      event.Records[0].dynamodb &&
      event.Records[0].dynamodb.NewImage &&
      event.Records[0].dynamodb.NewImage.ip
    ) {
      const { ip, record } = AWS.DynamoDB.Converter.unmarshall(event.Records[0].dynamodb.NewImage)
      const recordName = `${record}.${process.env.HOSTED_ZONE_NAME}`
      console.log(ip, record, recordName)
      const params = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: recordName,
                ResourceRecords: [{ Value: ip }],
                TTL: 60,
                Type: 'A'
              }
            }
          ],
          Comment: recordName
        },
        HostedZoneId: process.env.HOSTED_ZONE_ID
      }
      try {
        const result = await route53.changeResourceRecordSets(params).promise()
        console.log(result)
      } catch (exception) {
        console.log(exception)
      }
    } else {
      console.log('ignored')
    }

    return 'ok'
  }
}
