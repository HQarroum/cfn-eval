return new Promise((resolve, reject) => {
  const https = require('https');
  let data    = '';
  
  https.get({
    hostname: 'api.github.com',
    path: `/users/${props.Username}`,
    headers: {'user-agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'}
  }, (response) => {
    response.on('data', (d) => data += d)
      .on('end', () => resolve(JSON.parse(data)))
      .on('error', reject);
  }).on('error', reject).end();
});