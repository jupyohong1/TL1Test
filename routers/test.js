// routers/test.js
// const logger = require('../util/logger');
const express = require('express');
const router = express.Router();
const cmdList = require('../util/cmdList');

// get net
router.get('/', function(req, res) {
  // fs.readFile(htmlPath, function(err, data) {
  //   if (err) {
  //     res.send(err);
  //   } else {
  //     res.writeHead(200, {'Content-Type': 'text/html'});
  //     res.write(data);
  //     res.end();
  //   }
  // });  
  res.render('test.html', {cmdList: cmdList});
});


module.exports = router;
