const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket/index');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;
const server = http.createServer(app);

const prisma = require('./utils/prisma');

initSocket(server);

// Cleanup job for unsaved messages older than 24 hours
setInterval(async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await prisma.teamMessage.deleteMany({
      where: {
        isSaved: false,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });
    if (result.count > 0) {
      console.log(`[Cleanup] Deleted ${result.count} old unsaved messages.`);
    }
  } catch (error) {
    console.error('[Cleanup] Error deleting old messages:', error);
  }
}, 60 * 60 * 1000); // Run every hour

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
