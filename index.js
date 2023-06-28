console.log('Hi, world!');

const PORT = 3001;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const https = require('https');

io.on('connection', socket => {
  console.log('Client Connected!');

  socket.emit('crypto', '');

  socket.on('disconnect', () => {
    console.log('Client Disonnected!');
  });

  socket.on('message', data => {
    console.log(data);
  });
});

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});

const requestData = {
  currency: 'USD',
  sort: 'rank',
  order: 'ascending',
  offset: 0,
  limit: 20,
  meta: true,
};

const jsonData = JSON.stringify(requestData);

const options = {
  hostname: 'api.livecoinwatch.com',
  port: 443,
  path: '/coins/list',
  method: 'POST',
  headers: {
    'x-api-key': '7cc1965a-90a6-4add-b6a6-d770f0f2b887',
    'content-type': 'application/json',
  },
};

setInterval(() => {
  const req = https.request(options, res => {
    let str = '';
    res.on('data', chunk => (str += chunk));
    res.on('end', () => {
      const coins = JSON.parse(str).map(item => {
        return {
          rank: item.rank,
          symbol: item.symbol,
          name: item.name,
          code: item.code,
          rate: item.rate,
          cap: item.cap,
          volume: item.volume,
          allTimeHighUSD: item.allTimeHighUSD,
          day: item.delta.day,
          hour: item.delta.hour,
          week: item.delta.week,
          png32: item.png32,
          png32: item.png64,
        };
      });
      io.emit('crypto', coins);
    });
  });
  req.write(jsonData);
  req.end();
  req.on('error', function (e) {
    console.error(e);
  });
}, 5000);
