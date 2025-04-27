require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const nanoid = require('nanoid');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlDatabase = {};

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const middleware = async (req, res, next) => {
    try {
      const { hostname } = new URL(req.body.url);
      console.log(req.body.url);
      console.log(req.protocol);
      
      if (req.body.url.startsWith('http://')) {
        return res.status(400).json({ error: 'Invalid URL' });
      }
      
      dns.lookup(hostname, (err, address, family) => {
        if (err) {
          console.error(err);
          return res.status(400).json({ error: 'Invalid URL' });
        }
        next();
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid URL' });
    }
};

app.post('/api/shorturl', middleware,function(req, res) {
  const { url } = req.body;
  const shortId = 1;
  urlDatabase[shortId] = url;  
  res.json({ original_url: url, short_url: shortId });
});

app.get('/api/shorturl/:shortId',function(req, res) {
    const id = req.params.shortId;
    const originalUrl = urlDatabase[id];
    if(originalUrl){
      res.redirect(originalUrl);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
