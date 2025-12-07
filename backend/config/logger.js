'use strict';

const { transports } = require('winston');

module.exports = {
  level: 'info', // можно 'info' если не нужны подробные
  exposeInContext: true,
  requests: true,
  transports: [
    new transports.Console({
      level: 'debug',
      format: require('winston').format.simple(),
    }),
    new transports.File({
      filename: 'strapi.log',
      level: 'debug',
      format: require('winston').format.json(),
    }),
  ],
};