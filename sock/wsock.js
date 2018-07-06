// sock/wsock.js
const logger = require('../util/logger');
const socketIO = require('socket.io');

/**
 * Create Websocket
 * @param {object} http httpserver
 */
function wsock(http) {
  this.event = 'report';
  this.io = socketIO(http);

  this.io.on('connection', function(ws) {
    logger.trace(`webSocket connected`);

    ws.on('disconnect', function() {
      logger.trace('webSocket disconnected');
    });
  });
};

wsock.prototype.send = function(msg) {
  this.io.emit(this.event, msg);
  logger.trace(`send report, msg: ${msg}`);
};

wsock.prototype.getClientCount = function() {
  return this.io.engine.clientsCount;
};

module.exports = wsock;
