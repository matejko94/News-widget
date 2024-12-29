import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { cacheControlMiddleware } from './middleware/cache-control.middleware';
import { optionsMiddleware } from './middleware/options.middleware';

export const onRequest = [
    errorMiddleware,
    // cacheMiddleware,
    corsMiddleware,
    cacheControlMiddleware,
    optionsMiddleware,
];
