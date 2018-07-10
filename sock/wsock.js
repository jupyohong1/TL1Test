// sock/wsock.js
const logger = require('../util/logger');
const socketIO = require('socket.io');

let wsDataMap = undefined;

/**
 * Create Websocket
 * @param {object} http httpserver
 */
function wsock(http) {
  this.event = 'report';
  this.io = socketIO(http);
  
  if(wsDataMap == undefined) {
    wsDataMap = new Map();
  }

  this.io.on('connection', function(ws) {
    logger.trace(`webSocket connected`);
    ws.on('disconnect', function() {
      logger.trace('webSocket disconnected');
    });

    ws.on('reqCmd', function(msg){      
      wsDataMap.set(ws.id, msg);      
    })
  });
};

wsock.prototype.send = function(msg) {
  this.io.emit(this.event, msg);
  logger.trace(`send report, msg: ${msg}`);
};

wsock.prototype.sendto = function(id, event, msg) {
  this.io.to(id).emit(event, msg);
  logger.trace(`send to ${id}, event: ${event}, msg: ${msg}`);
};

wsock.prototype.getClientCount = function() {
  return this.io.engine.clientsCount;
};


wsock.prototype.getRecvCmdCount = function() {
  return wsDataMap.size;
}

wsock.prototype.deleteRecvCmd = function(key) {
  if (wsDataMap.get(key) != undefined) {
    wsDataMap.delete(key);
  }
};

wsock.prototype.getRecvCmd = function() {
  let itr = wsDataMap.entries();
  return itr.next().value;
}

module.exports = wsock;
