export const cacheMiddleware: PagesFunction = async ({ request, next }) => {
    const cache = caches.default;
    const cacheKey = request.url;

    if (request.headers.get('Cache-Control') !== 'no-cache') {
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            console.info('Cache hit', cacheKey);
            return cachedResponse;
        }
    }
    const response = await next();

    if (response.status === 200) {
        console.log('Caching response', cacheKey);
        await cache.put(cacheKey, response.clone());
    }

    return response;
}
