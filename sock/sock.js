// sock/sock.js
const logger = require('../util/logger');
const iconv = require('iconv-lite');
const TL1_COMMON = require('../tl1/tl1_common');
const net = require('net');

/**
 * Create socket
 * @param {string} name socket name
 * @param {string} ip IP address
 * @param {number} port port number
 */
function sock(name, ip, port) {
  this.ip = ip;
  this.port = port;
  this.name = name;

  this.client;
  this.isConn = false;
};

sock.prototype = {
  ip: null,
  getIp: function() {
    return this.ip;
  },
  setIp: function(ip) {
    this.ip = ip;
  },

  port: null,
  getPort: function() {
    return this.port;
  },
  setPort: function(port) {
    this.port = port;
  },

  name: null,
  getName: function() {
    return this.name;
  },
  setName: function(name) {
    this.name = name;
  },

  isConn: false,
  isConnect: function() {
    return this.isConn;
  },
  getConnectInfo: function() {
    const state = (this.isConn) ? 'Connected' : 'Disconnected';
    return `sock[${this.name}] is ${state}`;
  },

  isRecv: false,

  dataMap: new Map(),
  deleteDataMap: function(key) {
    if (this.dataMap.get(key) != undefined) {
       this.dataMap.delete(key);
    }
  },
  getDataMapCount: function(key) {
    return this.dataMap.size;
  },

  toString: function() {
    return `\
sock[${this.name}], ip[${this.ip}], port[${this.port}], conn[${this.isConn}]`;
  },

  client: null,
};

sock.prototype.connect = function() {
  this.client = net.connect({port: this.port, host: this.ip}, () => {
    this.isConn = true;
    logger.info(`\
sock[${this.name}] connect succes, server: ${this.ip}:${this.port}`);
  });

  this.client.on('data', (data) => {
    this.isRecv = true;
    const strContent = new Buffer(data);
    const recvData = iconv.decode(strContent, 'euckr').toString();
    const recvMsg = recvData.toString();
    const recvTL1Data = new TL1_COMMON.GetRecvMsg();
    recvTL1Data.parseHdr(recvMsg);
    if (this.name == 'CMD') {
      this.dataMap.set(Number(recvTL1Data.ctag), recvTL1Data);
    } else {
      this.dataMap.set(Number(recvTL1Data.ctag), recvMsg);
    }
    logger.info(`sock[${this.name}] recv data!, ctag[${recvTL1Data.ctag}]`);
  });

  this.client.on('timeout', () => {
    logger.warn(`sock[${this.name}] client occured timeout >> `);
  });

  this.client.on('end', () => {
    this.isConn = false;
    logger.warn(`sock[${this.name}] client disconnected`);
  });

  this.client.on('error', (err) => {
    this.isConn = false;
    logger.error(`sock[${this.name}] ${err}`);
  });

  this.client.on('close', () => {
    this.isConn = false;
    logger.error(`sock[${this.name}] closed, reconnect to after 3sec`);
    setTimeout(()=>{
      this.connect();
    }, 3000);
  });
};

sock.prototype.send = function(ctag, msg) {
  let writeOk = false;
  if (this.isConn) {
    writeOk = this.client.write(msg);
    logger.info(`sock[${this.name}] \
send msg[${Number(ctag)}, ${msg.substr(0, msg.length-2)}], result: ${writeOk}`);
    return writeOk;
  }
  return writeOk;
};

sock.prototype._promise = function(ctag) {
  return new Promise(((resolve, reject) => {
    setTimeout(() => {
      if (this.dataMap.size <= 0) {
        reject(new Error('Error'));
      } else {
        const obj = this.dataMap.get(Number(ctag));
        if (obj == undefined) {
          reject(new Error('Error'));
        } else {
          resolve(obj);
        }
      }
    }, 100);
  }));
};

sock.prototype.recv = async function(ctag, errCount) {
  let recvTL1Data;
  let isRecvOk = false;
  let error = errCount;

  await this._promise(ctag)
  .then(function(obj) {
    recvTL1Data = obj;
    isRecvOk = true;
  }, function() {
    error += 1;
  });

  if (isRecvOk) {
    if (recvTL1Data != undefined) {
      return {result: true, data: recvTL1Data, msg: null};
    }
  }

  if (error > 20) {
    const message = `\
not found data, tid: ${tid}, ctag: ${ctag}, errCount: ${error}`;
    return {result: false, data: null, msg: message};
  } else {
    await this.recv(ctag, error);
  }
};

sock.prototype._promiseRep = function() {
  return new Promise(((resolve, reject) => {
    setTimeout(() => {
      if (this.dataMap.size <= 0) {
        reject(new Error('Error'));
      } else {
        this.dataMap.forEach( function(value, key) {
          if (value == undefined) {
            reject(new Error('Error'));
          } else {
            resolve({value, key});
          }
        });
      }
    }, 100);
  }));
};

sock.prototype.recvRep = async function() {
  let recvValue;
  let isRecvOk = false;

  await this._promiseRep()
  .then(function(value, key) {
    recvValue = value;
    isRecvOk = true;
  });

  if (isRecvOk) {
    if (recvValue != undefined) {
      return {result: true, data: recvValue};
    }
  }
  await this.recvRep();
};

module.exports = sock;
