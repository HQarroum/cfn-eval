const crypto = require('crypto');

return ({
  FooMd5: crypto.createHash('md5').update(props.foo).digest("hex"),
  BarMd5: crypto.createHash('md5').update(props.bar).digest("hex"),
  FooSha1: crypto.createHash('sha1').update(props.foo).digest("hex"),
  BarSha1: crypto.createHash('sha1').update(props.bar).digest("hex")
});
