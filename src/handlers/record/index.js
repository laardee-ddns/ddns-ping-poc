'use strict';

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  let message = 'no change';
  if (typeof event.Records !== 'undefined' && typeof event.Records[0] !== 'undefined') {
    const ip = event.Records[0].dynamodb.NewImage.ip.S;
    const record = event.Records[0].dynamodb.NewImage.record.S;
    console.log(ip, record);
  }
  return callback(null, message);
};
