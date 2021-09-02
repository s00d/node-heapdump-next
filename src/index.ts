import * as os from "os";

type CB = (err?: null|Error, result?:string) => any

class Heapdump {
  private addon: any;
  private errno: {[key: number]: any} = {};

  constructor() {
    try {
      this.addon = require('../build/Release/addon');
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e;
      this.addon = require('../build/Debug/addon');
    }

    const kSignalFlag = this.addon.kSignalFlag;

    let flags = kSignalFlag;
    const options = (process.env.NODE_HEAPDUMP_OPTIONS || '').split(/\s*,\s*/);
    for (let i = 0, n = options.length; i < n; i += 1) {
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
    this.addon.configure(flags);
    this.errno = {};
    if (os.constants && os.constants.errno) {
      Object.keys(os.constants.errno).forEach((key) => {
        // @ts-ignore
        const value: number = os.constants.errno[key];
        this.errno[value] = key;
      });
    }
  }

  writeSnapshot(filename: string|undefined|CB, cb?: CB) {
    if (typeof filename === 'function') {
      cb = filename
      filename = undefined;
    }
    var result = this.addon.writeSnapshot(filename);
    var success = (typeof result === 'string');  // Filename or errno.
    // Make the callback. Yes, this is synchronous; it wasn't back when heapdump
    // forked before writing the snapshot, but it is now. index.js can postpone
    // the callback with process.nextTick() or setImmediate() if synchronicity
    // becomes an issue. Or just remove it, it's pretty pointless now.
    if (cb) {
      if (success) cb(null, result);
      else cb(new Error('heapdump write error ' + (this.errno[result] || result)));
    }
    return success;
  }
}

export { Heapdump }
