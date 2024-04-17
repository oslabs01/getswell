const express = require('express');
const path = require('path');
const ngrok = require('ngrok');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
dotenv.config();

const port = 3000;
const app = express();
const cors = require('cors');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: '*' }));

// * Previous teams added two cors for localhost and all, commented out localhost and kept * for all origins for potential API testing(?)
// app.use(cors({ origin: 'http://localhost:8080' }));

app.use(express.static(path.resolve(__dirname, '../../build')));

app.get('/', (_, res) => res.send('Hello World!'));

// Generate a new nonce for each request -- Temp
// ? Keeping this for the time being / Research possible backend nonce generation for Electron.js
// app.use((req, res, next) => {
//   const nonce = crypto.randomBytes(16).toString('base64');
//   res.locals.nonce = nonce;
//   res.setHeader(
//     'Content-Security-Policy',
//     `style-src 'self' 'nonce-${nonce}';`
//   );
//   return next();
// });

//  TODO: Figure out why previous groups decided to use socket.io
// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
// create a plain Node.JS HTTP server using the request handler functions generated by invoking express()
const server = require('http').createServer(app);

// https://www.npmjs.com/package/socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

// if u want to use routers, set socket io then google the rest
// https://stackoverflow.com/questions/47249009/nodejs-socket-io-in-a-router-page
app.set('socketio', io);

io.on('connection', (client) => {
  console.log('established websocket connection');

  client.on('message', (message) => {
    console.log('message received: ', message);
  });
});

/** @todo previous groups decided to use ngrok to add live collaboration session but could not finished */
app.post('/webhookServer', (req, res) => {
  console.log('Server Is On!');
  // ngrok
  //   .connect({
  //     proto: 'http',
  //     addr: '3000',
  //   })
  //   .then((url) => {
  //     console.log(`ngrok tunnel opened at: ${url}/webhook`);
  //     return res.status(200).json(url);
  //   });
});

/** @todo webhook is not working on swell */
app.delete('/webhookServer', (req, res) => {
  console.log('Server Is Off!');
  ngrok.kill();
  return res.status(200).json('the server has been deleted');
});

app.post('/webhook', (req, res) => {
  const data = { headers: req.headers, body: req.body };
  io.emit('response', data);
  return res.status(200).json(req.body);
});

app.get('/api/import', (_, res) => {
  return res.status(200).send(res.locals.swellFile);
});

// Unknown route handler
app.use((_, res) => {
  res.status(404).send('Not Found');
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = {
    ...defaultErr,
    ...err,
  };
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
});

server.listen(port, () => console.log(`Listening on port ${port}`));

