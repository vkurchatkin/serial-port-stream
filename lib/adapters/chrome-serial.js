/**
 * Imports
 */

if (!chrome)
  throw new Error('`chrome` is undefined');

var serial = chrome.serial;

if (!serial)
  throw new Error('Can\'t access `serial`. Check permissions.');

var DATA_BITS = { 7 : 'seven', 8 : 'eight' };
var STOP_BITS = { 1 : 'one', 2 : 'two' };
var PARITY_BIT = { 'none' : 'no', 'odd' : 'odd', 'even' : 'even' };

function ChromeSerialAdapter (path, options) {
  this._path = path;
  this._options = convertOptions(options);

  this._paused = true;

  this._connectionId = null;
  this.onData = null;
  this.onError = null;

  var self = this;

  serial.onReceive.addListener(function (info) {
    if (info['connectionId'] !== self._connectionId) return;

    self.onData(new Buffer(new Uint8Array(info['data'])));
  });
}

function convertOptions (options) {
  var opts = {};

  opts['bufferSize'] = options['bufferSize'];
  opts['bitrate'] = options['baudRate'];

  if (options['dataBits'] && DATA_BITS[options['dataBits']])
    opts['dataBits'] = DATA_BITS[options['dataBits']];

  if (options['stopBits'] && STOP_BITS[options['stopBits']])
    opts['stopbits'] = STOP_BITS[options['stopBits']];

  if (options['parity'] && PARITY_BIT[options['parity']])
    opts['parityBit'] = PARITY_BIT[options['parity']];

  return opts;
}

function open (callback) {
  var self = this;

  serial.connect(this._path, this._options, function (info) {
    self._connectionId = info['connectionId'];
    serial.setPaused(self._connectionId, self._paused, function () {});

    callback();
  });
}

function close (callback) {
  var self = this;

  serial.disconnect(this._connectionId, function () {
    self._connectionId = null;
    callback();
  });
}

function write (data, callback) {
  var self = this;

  serial.send(this._connectionId, data.buffer, function (info) {
    if (info.error) return callback(new Error(info.error));

    callback();
  });
}

function pause () {
  this._paused = true;

  if (!this._connectionId) return;

  serial.setPaused(this._connectionId, true, function () {});
}

function resume () {
  this._paused = false;

  if (!this._connectionId) return;

  serial.setPaused(this._connectionId, false, function () {});
}

/**
 * Proto
 */

ChromeSerialAdapter.prototype.open = open;
ChromeSerialAdapter.prototype.close = close;
ChromeSerialAdapter.prototype.write = write;
ChromeSerialAdapter.prototype.pause = pause;
ChromeSerialAdapter.prototype.resume = resume;

/**
 * Exports
 */

module.exports = ChromeSerialAdapter;
