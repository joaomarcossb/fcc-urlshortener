require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({extended: false}));

let urls = [];

app.post("/api/shorturl", function(req, res) {
  const getHostnameFromRegex = (url) => {
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return matches && matches[1];
  }
  hostname = getHostnameFromRegex(req.body.url);
  if (!hostname) res.json({ error: 'invalid url' });
  dns.lookup(hostname, (error, addresses) => {
    if (!error) {
       let newUrl = { original_url : req.body.url, short_url : urls.length + 1};
      urls.push(newUrl);
      res.json(newUrl);
    } else {
      res.json({ error: 'invalid url' });
    }
  });
});

app.get('/api/shorturl/:num', function(req, res) {
  for (let i = 0; i < urls.length; i++) {
    if (urls[i].short_url == req.params.num) {
        res.redirect(urls[i].original_url);
    }
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});