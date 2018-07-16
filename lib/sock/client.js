// lib/sock/client.js
const net = require('net');

/**
 * Client socket class
 */
class Client {
    /**
     * @param {string} name socket name
     * @param {string} ip connect ip
     * @param {number} port connect port
     */
    constructor(name, ip, port) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.isConnect = false;
        this.client = null;
        this.recvArray = [];

        this.sockEventFunc = null;
        this.combineDataFunc = null;

        this.recvData = null;
    };

    /**
     * @return {string} socket name
     */
    get getName() {
        return this.name;
    };

    /**
     * @return {string} connect ip
     */
    get getIp() {
        return this.ip;
    }

    /**
     * @return {number} connect port
     */
    get getPort() {
        return this.port;
    }

    /**
     * @return {boolean} connect status
     */
    get getIsConnect() {
        return this.isConnect;
    }

    /**
     * @return {Array} recvArray
     */
    get getRecvArray() {
        return this.recvArray;
    }

    /**
     * @return {number} recv count
     */
    get getRecvCount() {
        return this.recvArray.length;
    }

    /**
     * @return {function}
     */
    get getSockEventFunc() {
        return this.sockEventFunc;
    }

    /**
     * @param {function} event websocket event
     */
    set setSockEventFunc(event) {
        this.sockEventFunc = event;
    }

    /**
     * @param {function} func socketEventFunc
     */
    set setCombineDataFunc(func) {
        this.combineDataFunc = func;
    }

    /**
     * return {construction }
     */
    get getCombineDataFunc() {
        return this.combineDataFunc;
    }

    /**
     * change connectStatus, true/false
     */
    changeConnectStatus() {
        this.isConnect = this.isConnect ? false : true;
    };

    /**
     * @param {class} param Client class
     * Client ConnectStatus change
     */
    connProc(param) {
        param.changeConnectStatus();
    }

    /**
     * Connect to host
     */
    connect() {
        this.client = net.connect(
            {host: this.ip, port: this.port}, this.connProc(this));
        this.setEvent();
    }

    /**
     * Set client socket events
     */
    setEvent() {
        this.client.on('data', (data) => {
            if (this.getCombineDataFunc != null) {
                let ret = this.combineDataFunc(this.recvData, data);
                if (ret.result == true) {
                    this.setData(ret.data);
                    this.recvData = null;
                } else {
                    this.recvData = ret.data;
                }
            } else {
                this.setData(data);
            }
        });

        this.client.on('end', () => {
            this.changeConnectStatus();
        });

        this.client.on('error', (err) => {
            this.changeConnectStatus();
        });

        this.client.on('close', () => {
            this.changeConnectStatus();
            setTimeout(() => {
                this.connect();
            }, 3000);
        });

        if (this.sockEventFunc != null) {
            this.sockEventFunc();
        }
    }

    /**
     * 데이터 전송
     * @param {*} data send data
     * @return {boolean} send result
     */
    send(data) {
        if (!this.getIsConnect) {
            return false;
        }
        return this.client.write(data);
    }

    /**
     * push data to Array
     * @param {*} data send or recv data
     */
    setData(data) {
        this.recvArray.push(data);
    }

    /**
     * Get data from Array
     * @return {*} recvData
     */
    getData() {
        // console.log(this.recvArray);
        return this.recvArray.pop();
    }

    /**
     * @return {string} string to Client
     */
    toString() {
        return `\
sock[${this.name}], ip[${this.ip}], \
port[${this.port}], conn[${this.isConnect}]`;
    }
};

module.exports = Client;

// const csock = new Client('test', '192.168.131.251', 6300);
// csock.Connect();
// if (csock.getIsConnect) {
//     csock.SetEvent();
//     console.log('---------------------');
//     console.log(csock);
// }

