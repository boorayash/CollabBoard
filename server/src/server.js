const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/index');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
