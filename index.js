// index.js
const logger = require('./util/logger');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const socketMgr = require('./sock/sock_mgr');

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

console.log(__dirname);
app.set('views', __dirname + '\\static\\html');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('static'));

// ems connect
const emsPort = [6200, 6300];
const emsIP = '192.168.135.251';
// const emsIP = '192.168.135.54';


// API
app.use('/test', require('./routers/test.js'));

// server
const http = require('http').Server(app);
const port = 3000;
socketMgr.createWebSocket(http);
http.listen(port, function() {
  logger.trace(`listening on Web port: ${port}`);
});

socketMgr.createEMSSocket(emsIP, emsPort[0], emsPort[1]);
// socketMgr.repProc();
socketMgr.reqProc();
