// sock/sock_mgr.js
const logger = require('../util/logger');
const sock = require('./sock');
const wsock = require('./wsock');
const TL1_COMMON = require('../tl1/tl1_common');

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

sockMgr.reqProc = async function() {
  try {
    while (sockMgr.webSock.getRecvCmdCount() > 0) {
      let recvData = sockMgr.webSock.getRecvCmd();
      let sockId = recvData[0];
      let cmd = recvData[1];
      sockMgr.webSock.deleteRecvCmd(sockId);
      logger.trace(`recv cmd, sock: ${sockId}, cmd: ${cmd}`);

      let resMsg = '';
      if (sockMgr.cmdSock.isConnect()) {
        sendTL1 = new TL1_COMMON.GetSendMsg();
        sendTL1.parse(cmd);

        if (sockMgr.cmdSock.send(sendTL1.ctag, sendTL1.toString())) {
          let recvData = await sockMgr.cmdSock.recv(sendTL1.ctag, 0);
          if (recvData == undefined) {
            recvData = await sockMgr.cmdSock.recv(sendTL1.ctag, 0);
          }
          resMsg = recvData.data.recvMsg;
        } else {
          resMsg = `TL1 send fail`;
          logger.warn(resMsg);
        }
      } else {
        resMsg = 'CMD socket disconnected';
        logger.error(resMsg);
      }

      sockMgr.webSock.sendto(sockId, 'resCmd', resMsg);
    }
  } catch (exception) {
    logger.error(exception);
  }

  setTimeout(sockMgr.reqProc, 100);
};


module.exports = sockMgr;
