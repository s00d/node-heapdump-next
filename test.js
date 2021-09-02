const Heapdump = require('../dist/index').Heapdump;
console.log(Heapdump)
const heapdump = new Heapdump()
setTimeout(() => {
  heapdump.writeSnapshot(__dirname + Date.now() + '.heapsnapshot');
}, 10000)
