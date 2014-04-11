require('should');

var SerialPortStream = require('./index.js');
var EventEmitter = require('events').EventEmitter;

describe('SerialPortStream', function () {
  it('should emit `open`', function (done) {
    var sp = new EventEmitter;

    sp.pause = function () {};

    var sps = new SerialPortStream({ sp : sp });

    sps.on('open', done);

    setImmediate(function () {
      sp.emit('open');
    });
  });

  it('should queue writes before opened', function (done) {
    var sp = new EventEmitter;
    var opened = false;

    sp.pause = function () {};
    sp.write = function (chunk, callback) {
      opened.should.be.true;
      done();
    };

    var sps = new SerialPortStream({ sp : sp });

    sps.write('dasdas\n');

    setImmediate(function () {
      opened = true;
      sp.emit('open');
    });
  });

  it('should auto close when ended', function (done) {
    var sp = new EventEmitter;

    sp.pause = function () {};
    sp.write = function (chunk, callback) {
      callback();
    };

    sp.close = function () {
      setImmediate(function () {
        sp.emit('close');
      })
    };

    sp.drain = function (callback) {
      setImmediate(callback);
    };

    var sps = new SerialPortStream({ sp : sp });

    sps.write('dasdas\n');
    sps.end('dasdas\n');

    sp.on('close', done);
    sp.emit('open');
  });
});
