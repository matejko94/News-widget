const corsMiddleware: PagesFunction = async ({request, next}) => {
    const response = await next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (request.method !== 'OPTIONS') {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
};

const errorMiddleware: PagesFunction = async ({next}) => {
    try {
        return await next();
    } catch (e) {
        console.error('Error while handling request', e);
        return new Response(e.message, {status: 500});
    }
}

const cacheMiddleware: PagesFunction = async ({request, next}) => {
    const cache = caches.default;
    const cacheKey = request.url
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await next();

    if (response.status === 200) {
        await cache.put(cacheKey, response.clone());
    }

    return response;
}

const optionsMiddleware: PagesFunction = async ({request, next}) => {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    return next();
}
const cacheControlMiddleware: PagesFunction = async ({request, next}) => {
    const response = await next();

    if (response.status === 200) {
        response.headers.set('Cache-Control', 'public, max-age=86400');
    }

    return response;
};

export const onRequest = [
    errorMiddleware,
    cacheMiddleware,
    corsMiddleware,
    cacheControlMiddleware,
    optionsMiddleware,
];
