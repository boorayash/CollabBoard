const { PrismaClient } = require('@prisma/client');

const isDev = process.env.NODE_ENV === 'development';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
  });
};

// Use a global variable to prevent creating multiple connections in development mode during hot-reloads
const prisma = global.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

module.exports = prisma;
