import * as os from "os";

try {
  var addon = require('./build/Release/addon');
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  var addon = require('./build/Debug/addon');
}

var kSignalFlag = addon.kSignalFlag;

var flags = kSignalFlag;
var options = (process.env.NODE_HEAPDUMP_OPTIONS || '').split(/\s*,\s*/);
for (var i = 0, n = options.length; i < n; i += 1) {
  const option = options[i];
  if (option === '') {
    continue;
  } else if (option === 'signal') {
    flags |= kSignalFlag;
  } else if (option === 'nosignal') {
    flags &= ~kSignalFlag;
  } else {
    console.error('node-heapdump: unrecognized option:', option);
  }
}
addon.configure(flags);
var errno: {[key: number]: any} = [];
if (os.constants && os.constants.errno) {
  Object.keys(os.constants.errno).forEach(function(key) {
    // @ts-ignore
    var value: number = os.constants.errno[key];
    errno[value] = key;
  });
}

type CB = (err?: null|Error, result?:string) => any

const writeSnapshot = function(filename: string|undefined|CB, cb?: CB) {
  if (typeof filename === 'function') {
    cb = filename
    filename = undefined;
  }
  var result = addon.writeSnapshot(filename);
  var success = (typeof result === 'string');  // Filename or errno.
  // Make the callback. Yes, this is synchronous; it wasn't back when heapdump
  // forked before writing the snapshot, but it is now. index.js can postpone
  // the callback with process.nextTick() or setImmediate() if synchronicity
  // becomes an issue. Or just remove it, it's pretty pointless now.
  if (cb) {
    if (success) cb(null, result);
    else cb(new Error('heapdump write error ' + (errno[result] || result)));
  }
  return success;
};

export { writeSnapshot }
