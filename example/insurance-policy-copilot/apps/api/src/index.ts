import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { config } from './config.js';
import { registerRoutes } from './routes.js';

const app = Fastify({
  logger: true,
  bodyLimit: 20 * 1024 * 1024
});

await app.register(cors, {
  origin: true
});

await app.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 1
  }
});

await registerRoutes(app);

await app.listen({
  port: config.apiPort,
  host: '0.0.0.0'
});

