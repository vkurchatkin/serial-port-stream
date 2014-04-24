var stream = require('./lib/stream.js');
var adapter = require('./lib/adapters/node-serialport.js');

stream.setAdapter(adapter);

delete stream.setAdapter;

module.exports = stream;
