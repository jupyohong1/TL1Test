// sock/sock_mgr.js
const logger = require('../lib/log/logger');
const Client = require('../lib/sock/client');
const WebSock = require('../lib/sock/web');
const TL1_COMMON = require('../tl1/tl1_common');
const iconv = require('iconv-lite');

const sockMgr = {
  cmdSock: null,
  repSock: null,
  webSock: null,
};

sockMgr.createEMSSocket = function(ip, cmdPort, repPort) {
  sockMgr.cmdSock = new Client('CMD', ip, cmdPort);
  // console.log(combineTL1Data);
  sockMgr.cmdSock.setCombineDataFunc = combineTL1Data;
  logger.trace(sockMgr.cmdSock.toString());
  sockMgr.cmdSock.connect();

  sockMgr.repSock = new Client('REP', ip, repPort);
  sockMgr.repSock.setCombineDataFunc = combineTL1Data;
  logger.trace(sockMgr.repSock.toString());
  sockMgr.repSock.connect();
};

sockMgr.createWebSocket = function(http) {
  const event = function(ws, param) {
    ws.on('reqCmd', function(msg) {
      const data = {
        id: ws.id,
        msg: msg,
      };
      param.setData(data);
    });
  };

  sockMgr.webSock = new WebSock(http, event);
};

sockMgr.repProc = async function() {
  try {
    while (sockMgr.repSock.getRecvCount > 0) {
      let recvData = await getClientRecvData(sockMgr.repSock, 0);
      if (recvData == undefined) {
        recvData = await getClientRecvData(sockMgr.repSock, 0);
      }

      if (recvData.result) {
        if (sockMgr.webSock.getConnCount > 0) {
          sockMgr.webSock.send('report', recvData.msg.recvMsg);
        }
      }
    }
  } catch (exception) {
    logger.error(exception);
    console.log(exception);
  }

  setTimeout(sockMgr.repProc, 1000);
};

sockMgr.reqProc = async function() {
  try {
    while (sockMgr.webSock.getRecvCount > 0) {
      let recvData = sockMgr.webSock.getData();
      let sockId = recvData.id;
      let cmd = recvData.msg;
      logger.trace(`recv cmd, sock: ${sockId}, cmd: ${cmd}`);

      let resMsg = '';
      if (sockMgr.cmdSock.getIsConnect) {
        sendTL1 = new TL1_COMMON.GetSendMsg();
        sendTL1.parse(cmd);

        if (sockMgr.cmdSock.send(sendTL1.toString())) {
          logger.trace(`send TL1: ${sendTL1.toString()}`);
          let recvData = await getClientRecvData(sockMgr.cmdSock, 0);
          if (recvData == undefined) {
            recvData = await getClientRecvData(sockMgr.cmdSock, 0);
          }
          resMsg = recvData.msg.recvMsg;
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
    console.log(exception);
  }

  setTimeout(sockMgr.reqProc, 100);
};


combineTL1Data = function(TL1Data, recvData) {
  const tmpBuff = new Buffer(recvData);
  const decodeData = iconv.decode(tmpBuff, 'euckr').toString();
  const recvMsg = decodeData.toString();

  if (TL1Data == null) {
      TL1Data = new TL1_COMMON.GetRecvMsg();
  }
  TL1Data.setRecvMsg(recvMsg);

  return {
      result: TL1Data.isRecvComplete,
      data: TL1Data,
  };
};

promiseClientRecvData = function(client) {
  return new Promise((function(resolve, reject) {
      setTimeout(function() {
          if (client.getRecvCount <= 0) {
            reject(new Error('noData'));
          } else {
            resolve(client.getData());
          }
      }, 100);
  }));
};

getClientRecvData = async function(client, errCount) {
  let recvData;
  let isRecvOk = false;
  let errMsg;
  let error = errCount;

  await promiseClientRecvData(client)
  .then(function(obj) {
      recvData = obj;
      isRecvOk = true;
  }, function(msg) {
      errMsg = msg;
      error += 1;
  });

  if (isRecvOk) {
      return {
          result: true,
          msg: recvData,
      };
  }

  if (error > 20) {
      return {
          result: false,
          msg: errMsg,
      };
  } else {
      await getClientRecvData(client, error);
  }
};

module.exports = sockMgr;
