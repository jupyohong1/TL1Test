// sock/sock_mgr.js
const logger = require('../util/logger');
const sock = require('./sock');
const wsock = require('./wsock');

const sockMgr = {
  cmdSock: null,
  repSock: null,
  webSock: null,
};

sockMgr.createEMSSocket = function(ip, cmdPort, repPort) {
  sockMgr.cmdSock = new sock('CMD', ip, cmdPort);
  logger.trace(sockMgr.cmdSock.toString());
  sockMgr.cmdSock.connect();

  sockMgr.repSock = new sock('REP', ip, repPort);
  logger.trace(sockMgr.repSock.toString());
  sockMgr.repSock.connect();
};

sockMgr.createWebSocket = function(http) {
  sockMgr.webSock = new wsock(http);
};

sockMgr.repProc = async function() {
  try {
    while (sockMgr.repSock.getDataMapCount() > 0) {
      let recvData = await sockMgr.repSock.recvRep();
      if (recvData == undefined) {
        recvData = await sockMgr.repSock.recvRep();
      }

      if (recvData.result) {
        if (sockMgr.webSock.getClientCount() > 0) {
          sockMgr.webSock.send(recvData.data.value);
        }
        sockMgr.repSock.deleteDataMap(recvData.data.key);
      }
    }
  } catch (exception) {
    logger.error(exception);
  }

  setTimeout(sockMgr.repProc, 1000);
};


module.exports = sockMgr;
