// tl1/tl1_common.js
const CRLF = '\r\n';
const COLON = ':';
const SEMICOLON = ';';
const TL1_COMMON = {};

TL1_COMMON.GetSendMsg = function() {
  this.cmd = '';
  this.tid = '';
  this.aid = '';
  this.ctag = '';
  this.param = '';
};

TL1_COMMON.GetSendMsg.prototype.toString = function() {
  return this.cmd + ':' + this.tid + ':' + this.aid + ':' + this.ctag + ':'
  + this.param + ';' + CRLF;
};

TL1_COMMON.GetSendMsg.prototype.parse = function(msg) {
  let sp = 0;
  let ep = 0;
  let tmpMsg = msg.trim();

  // cmd
  ep = tmpMsg.indexOf(COLON, sp);
  if (ep <= 0) {
    console.log(`cmd, ep: ${ep}, sp: ${sp}`);
  }
  this.cmd = tmpMsg.slice(sp, ep);
  sp = ep + 1;

  // tid
  ep = tmpMsg.indexOf(COLON, sp);
  if (ep < 0) {
    console.log(`tid, ep: ${ep}, sp: ${sp}`);
  } else if (ep != sp) {
    this.tid = tmpMsg.slice(sp, ep);
  }
  sp = ep + 1;

  // aid
  ep = tmpMsg.indexOf(COLON, sp);
  if (ep < 0) {
    console.log(`aid, ep: ${ep}, sp: ${sp}`);
  } else if (ep != sp) {
    this.aid = tmpMsg.slice(sp, ep);
  }
  sp = ep + 1;

  // ctag
  bParam = true;
  ep = tmpMsg.indexOf(COLON, sp);
  if (ep < 0) {
    ep = tmpMsg.indexOf(SEMICOLON, sp);
    if (ep > 0) {
      bParam = false;
    }
  }
  if (ep != sp) {
    this.ctag = tmpMsg.slice(sp, ep);
  }
  sp = ep + 1;

  // param
  if (bParam) {
    ep = tmpMsg.indexOf(SEMICOLON, sp);
    if (ep < 0 ) {
      console.log(`param, ep: ${ep}, sp: ${sp}`);
    } else if (ep != sp) {
      this.param = tmpMsg.slice(sp, ep);
    }
  }
};

TL1_COMMON.GetRecvMsg = function() {
  this.tid = '';
  this.datetime = '';
  this.type = '';
  this.ctag = '';
  this.code = '';
  this.items = [];
  this.errcode = '';
  this.errtxt = '';
  this.recvMsg = '';
  this.isRecvComplete = false;
};

TL1_COMMON.GetRecvMsg.prototype.setRecvMsg = function(msg) {
  this.recvMsg += msg;
  if (msg.lastIndexOf(SEMICOLON) > 0) {
    this.isRecvComplete = true;
  }
};

TL1_COMMON.GetRecvMsg.prototype.parse = function() {
  let sp = 0;
  let ep = 0;
  let i = 0;
  let spHdr = 0;
  let epHdr = 0;
  let tmpMsg = this.recvMsg.trim();

  // console.log(msg);
  while ((ep = tmpMsg.indexOf(CRLF, sp)) >= 0) {
    let line = tmpMsg.slice(sp, ep);
    // console.log(`line: ${line}`);
    if (i == 0) {
      spHdr = 0, epHdr = line.indexOf(' ');
      this.tid = line.slice(spHdr, epHdr);

      spHdr = epHdr + 1;
      epHdr = line.indexOf(' ', spHdr);
      this.datetime = line.slice(spHdr, epHdr);

      spHdr = epHdr + 1;
      this.datetime += ' ' + line.slice(spHdr);
    } else if (i == 1) {
      spHdr = 0, epHdr = 2;
      this.type = line.slice(spHdr, epHdr).trim();

      spHdr = epHdr + 1;
      epHdr = line.indexOf(' ', spHdr);
      this.ctag = line.slice(spHdr, epHdr);

      spHdr = epHdr + 1;
      this.code = line.slice(spHdr);
    } else {
      if (this.code == 'COMPLD') {
        spHdr = line.indexOf('"');
        if (spHdr >= 0) {
          let item = line.slice(spHdr);
          // console.log(`item: ${item}`);
          this.items.push(item);
        }
      } else {
        if (i == 2) {
          this.errcode = line.trim();
        } else if (i == 3) {
          this.errtxt = line.trim();
        }
      }
    }

    sp = ep + 2;
    // console.log("TMP_MSG:" + tmp_msg.toString());
    i++;
  }

  // console.log(this);
};

module.exports = TL1_COMMON;
