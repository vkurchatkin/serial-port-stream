
/**
 * Imports
 */

var Duplex = require('stream').Duplex;
var util = require('util');

var SerialPort = require('serialport').SerialPort;

var OPTS = [ 
  'baudrate',
  'dataBits',
  'stopBits',
  'parity',
  'rtscts',
  'xon',
  'xoff',
  'xany',
  'flowControl'
];

function SerialPortStream (path, options) {
  if (!(this instanceof SerialPortStream))
    return new SerialPortStream(path, options);

  Duplex.call(this, { allowHalfOpen : false });

  if ('object' === typeof path && 
      '[object String]' !== Object.prototype.toString.call(path)) {
    options = path;
    path = options.path;
  }

  if (!options.sp && !path)
    throw new Error('No `path` or `sp`');

  options = options || {};

  this._sp = options.sp;

  if (!this._sp) {

    var opts = {};

    OPTS.forEach(function (opt) {
      if (options.hasOwnProperty(opt))
        opts[opt] = options[opt];
    });

    this._sp = new SerialPort(path, opts);
  }

  this._opened = !! this._sp.fd;
  this._closed = false;
  this._destroyed = false;

  var stream = this;

  if (this._opened) {
    process.nextTick(function () {
      stream.emit('open');
    });
  }

  this._sp.on('open', onSPOpen.bind(this));
  this._sp.on('close', onSPClose.bind(this));
  this._sp.on('data', onSPData.bind(this));
  this._sp.on('error', onSPError.bind(this));

  this._sp.pause();

  this._autoClose = options.hasOwnProperty('autoClose') ? options.autoClose : true;

  if (this._autoClose)
    this.once('finish', this.destroy);
}

util.inherits(SerialPortStream, Duplex);

function write (chunk, encoding, callback) {
  if (!this._opened) {
    this.once('open', function () {
      this._write(chunk, encoding, callback);
    });

    return;
  }

  var stream = this;

  this._sp.write(chunk, function (err) {
    if (err) {
      if (stream._autoClose)
        stream.destroy();

      return callback(err);
    }

    stream._sp.drain(function (err) {
      if (err) {
        if (stream._autoClose)
          stream.destroy();

        return callback(err);
      }

      callback();
    });
  });
}

function read () {
  this._sp.resume();
}

function close (callback) {
  if (callback)
    this.once('close', callback);

  if (this._opened && this._closed) // closing already
    return;

  if (!this._opened || this._closed) {
    this.once('open', close);
    return;
  }

  this._closed = true;

  this._sp.close();
}

function destroy () {
  if (this._destroyed) return;
  this._destroyed = true;

  this.close();
}

function onSPOpen () {
  if (this._opened) return;

  this._opened = true;
  this.emit('open');
}

function onSPClose () {
  if (!this._opened) return;

  this._opened = false;
  this._closed = true;

  this.emit('close');
}

function onSPData (chunk) {
  if (!this.push(chunk))
    this._sp.pause();
}

function onSPError (err) {
  this.emit('error', err);
}

/**
 * Proto
 */

SerialPortStream.prototype._write = write;
SerialPortStream.prototype._read = read;
SerialPortStream.prototype.close = close;
SerialPortStream.prototype.destroy = destroy;

/**
 * Exports
 */

module.exports = SerialPortStream;
