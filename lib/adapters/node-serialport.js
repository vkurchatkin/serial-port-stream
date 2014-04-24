/**
 * Imports
 */

var SerialPort = require('serialport').SerialPort;

function NodeSerialportAdapter (path, options) {
  options = convertOptions(options);

  this.onData = null;
  this.onError = null;

  this._sp = new SerialPort(path, options, false);

  var self = this;

  this._sp.on('error', function (error) {
    self.onError(error);
  });

  this._sp.on('data', function (data) {
    self.onData(data);
  });

}

function convertOptions (options) {
  var opts = {};

  opts['buffersize'] = options['bufferSize'];
  opts['baudrate'] = options['baudRate'];
  opts['databits'] = options['dataBits'];
  opts['stopbits'] = options['stopBits'];
  opts['parity'] = options['parity'];

  return opts;
}

function open (callback) {
  this._sp.open(callback);
}

function close (callback) {
  this._sp.close(callback);
}

function write (data, callback) {
  var self = this;

  this._sp.write(data, function (err) {
    if (err) return callback(err);

    self._sp.drain(callback);
  });
}

function pause () {
  this._sp.pause();
}

function resume () {
  this._sp.resume();
}

/**
 * Proto
 */

NodeSerialportAdapter.prototype.open = open;
NodeSerialportAdapter.prototype.close = close;
NodeSerialportAdapter.prototype.write = write;
NodeSerialportAdapter.prototype.pause = pause;
NodeSerialportAdapter.prototype.resume = resume;

/**
 * Exports
 */

module.exports = NodeSerialportAdapter;
