/**
 * Tools
 */

require('should');

/**
 * Subject
 */
var SerialPortStream = require('./lib/stream.js');

describe('SerialPortStream', function () {
  it('should emit `open`', function (done) {
    function Adapter () {
      this.open = function (cb) {
        setImmediate(cb);
      };
    }

    SerialPortStream.setAdapter(Adapter);

    var sps = new SerialPortStream('/some/path', {});

    sps.on('open', done);
  });

  it('should queue writes before opened', function (done) {
    var opened = false;

    function Adapter () {
      this.open = function (cb) {
        setImmediate(function () {
          opened = true;
          cb();
        });
      };

      this.write = function (chunk, callback) {
        opened.should.be.true;
        done();
      };
    }

    SerialPortStream.setAdapter(Adapter);

    var sps = new SerialPortStream('/some/path', {});

    sps.write('dasdas\n');
  });

  it('should auto close when ended', function (done) {
    function Adapter () {
      this.open = 
      this.close = function (cb) {
        setImmediate(cb);
      };

      this.write = function (data, cb) {
        setImmediate(cb);
      };
    }

    SerialPortStream.setAdapter(Adapter);

    var sps = new SerialPortStream('/some/path', {});

    sps.on('close', done);

    sps.write('dasdas\n');
    sps.end('dasdas\n');
  });
});
