"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heapdump = void 0;
var os = __importStar(require("os"));
var Heapdump = /** @class */ (function () {
    function Heapdump() {
        var _this = this;
        this.errno = {};
        try {
            this.addon = require('../build/Release/addon');
        }
        catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND')
                throw e;
            this.addon = require('../build/Debug/addon');
        }
        var kSignalFlag = this.addon.kSignalFlag;
        var flags = kSignalFlag;
        var options = (process.env.NODE_HEAPDUMP_OPTIONS || '').split(/\s*,\s*/);
        for (var i = 0, n = options.length; i < n; i += 1) {
            var option = options[i];
            if (option === '') {
                continue;
            }
            else if (option === 'signal') {
                flags |= kSignalFlag;
            }
            else if (option === 'nosignal') {
                flags &= ~kSignalFlag;
            }
            else {
                console.error('node-heapdump: unrecognized option:', option);
            }
        }
        this.addon.configure(flags);
        this.errno = {};
        if (os.constants && os.constants.errno) {
            Object.keys(os.constants.errno).forEach(function (key) {
                // @ts-ignore
                var value = os.constants.errno[key];
                _this.errno[value] = key;
            });
        }
    }
    Heapdump.prototype.writeSnapshot = function (filename, cb) {
        if (typeof filename === 'function') {
            cb = filename;
            filename = undefined;
        }
        var result = this.addon.writeSnapshot(filename);
        var success = (typeof result === 'string'); // Filename or errno.
        // Make the callback. Yes, this is synchronous; it wasn't back when heapdump
        // forked before writing the snapshot, but it is now. index.js can postpone
        // the callback with process.nextTick() or setImmediate() if synchronicity
        // becomes an issue. Or just remove it, it's pretty pointless now.
        if (cb) {
            if (success)
                cb(null, result);
            else
                cb(new Error('heapdump write error ' + (this.errno[result] || result)));
        }
        return success;
    };
    return Heapdump;
}());
exports.Heapdump = Heapdump;
