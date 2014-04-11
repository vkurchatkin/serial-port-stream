# serial-port-stream

Duplex stream wrapper around [node-serialport](https://github.com/voodootikigod/node-serialport)

# Features:

 - auto open;
 - auto close;
 - real `Duplex` stream :-).

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
 - `SerialPortStream(path, options)` or
 - `new SerialPortStream(options)` or
 - `SerialPortStream(options)`;

## Options:

 - `path` — is used when only options are passed;
 - `sp` — external instance of `SerialPort`, if is present,
    then `path` and other serial port related options are
    not used;
 - `autoClose` — auto close on `finish`, `true` by default;
 - `baudrate`, `dataBits`, `stopBits`, `parity`, `rtscts`,
   `xon`, `xoff`, `xany`, `flowControl` — proxied to `SerialPort`.

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
var stream = new SerialPortStream('/dev/ttyUSB0', { baudrate : 9600 });

stream.end('Hello world!\n');
```

# License

MIT