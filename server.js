const express = require('express');

const app = express();
const PORT = 3000;

const dns = require('dns');
app.use(express.urlencoded());

app.use(express.static('public'));

let redirectUrl;
const urlRegex = url => {
  const regexFormat = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(regexFormat);
  return url.match(regex) ? true : false;
};

const checkDNS = url => {
  const regexFormat = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
  const regex = new RegExp(regexFormat);
  const parseURL = url.match(regex);

  return new Promise((resolve, reject) => {
    dns.lookup(String(parseURL), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const returnAnswer = async (req, res) => {
  const invalidURL = { error: 'invalid URL' };
  const url = req.body.url;
  if (!urlRegex(url)) return res.json(invalidURL);

  try {
    await checkDNS(url);

    redirectUrl = { original_url: url, shortened_url: url.length };
    return res.json(redirectUrl);
  } catch {
    res.json(invalidURL);
  }
};

app.get('/api', (req, res) => res.json({ hi: 'hi' }));

app.get('/api/shorturl/', (req, res) =>
  redirectUrl
    ? res.status(301).redirect(redirectUrl.original_url)
    : res.send('Please enter a valid url first')
);

app.post('/api/url-shortner', returnAnswer);

app.listen(PORT, () => console.log('listening on port 3000'));
