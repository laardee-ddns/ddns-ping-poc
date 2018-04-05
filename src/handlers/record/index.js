'use strict';

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  return callback(null, 'ok');
};
