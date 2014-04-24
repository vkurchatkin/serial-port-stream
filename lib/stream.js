
/**
 * Imports
 */

var Duplex = require('stream').Duplex;
var util = require('util');

var Adapter = null;

function setAdapter (adapterCtor) {
  Adapter = adapterCtor;
}

function SerialPortStream (path, options) {
  if (!(this instanceof SerialPortStream))
    return new SerialPortStream(path, options);

  Duplex.call(this, { allowHalfOpen : false });

  if (!Adapter)
    throw new Error('Adapter is undefined');

  options = options || {};

  this._opened = false;
  this._closed = false;
  this._destroyed = false;

  this._adapter = new Adapter(path, options);

  var self = this;

  this._adapter.onData = function (data) {
    if (!self.push(data))
      self._adapter.pause();
  }

  this._adapter.onError = function (err) {
    self.emit('error', err);
  }

  this._adapter.open(function (err) {
    if (err) return self.emit('error', err);

    self._opened = true;
    self.emit('open');
  });

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

  this._adapter.write(chunk, function (err) {
    if (err) {
        if (stream._autoClose)
          stream.destroy();

        return callback(err);
      }

      callback();
  });
}

function read () {
  this._adapter.resume();
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

  var self = this;

  this._adapter.close(function (err) {
    if (err) return self.emit('error', err);

     self.emit('close');
  });
}

function destroy () {
  if (this._destroyed) return;
  this._destroyed = true;

  this.close();
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
module.exports.setAdapter = setAdapter;
