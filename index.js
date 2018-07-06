// index.js
const logger = require('./util/logger');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const socketMgr = require('./sock/sock_mgr');

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// ems connect
const emsPort = [6200, 6300];
 const emsIP = '127.0.0.1';


// API
app.use('/api', require('./routers/api/router'));

// repPort
app.use('/report', require('./routers/report'));

// server
const http = require('http').Server(app);
const port = 3000;
socketMgr.createWebSocket(http);
http.listen(port, function() {
  logger.trace(`listening on Web port: ${port}`);
});

socketMgr.createEMSSocket(emsIP, emsPort[0], emsPort[1]);
socketMgr.repProc();
