# serial-port-stream

Serial port as a duplex stream.

Works in node via [node-serialport](https://github.com/voodootikigod/node-serialport)
and in chrome with [browserify](https://github.com/substack/node-browserify) via [chrome.serial](https://developer.chrome.com/apps/serial)

# Features:

 - auto open;
 - auto close;
 - real `Duplex` stream;
 - work with browserify in chrome extensions and apps.

# Install

```
npm install serial-port-stream
```

and then:

```javascript
var SerialPortStream = require('serial-port-stream');
```

# Usage:

 - `new SerialPortStream(path, options)` or
 - `SerialPortStream(path, options)`;

## Options:

 - `autoClose` — auto close on `finish`, `true` by default;
 - `baudRate`;
 - `dataBits`;
 - `stopBits`;
 - `parity`.

## Methods:

 - `close`;
 - `destroy`.

Just like `fs` streams.

## Events:

 - `open`;
 - `close`;
 - `error`.

# Example:

```javascript
var SerialPortStream = require('serial-port-stream');
var stream = new SerialPortStream('/dev/ttyUSB0', { baudRate : 9600 });

stream.end('Hello world!\n');
```

# License

MIT