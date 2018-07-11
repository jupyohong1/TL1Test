const fs = require('fs');

const cmdList = JSON.parse(
    fs.readFileSync('./static/data/cmdlist.json', 'utf8'));

module.exports = cmdList;
