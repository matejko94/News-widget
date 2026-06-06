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

    // Never cache the SPA shell (index.html / navigations) — it must always be re-fetched so
    // a new deploy is picked up immediately. Hashed assets and API responses still get cached.
    const isHtml = (response.headers.get('Content-Type') ?? '').includes('text/html');

    if (response.status === 200 && !isHtml) {
        console.log('Caching response', cacheKey);
        await cache.put(cacheKey, response.clone());
    }

    return response;
}
