export const cacheMiddleware: PagesFunction = async ({ request, next }) => {
    const cache = caches.default;
    const cacheKey = request.url;

    // Never serve from cache for:
    //  - navigation requests (the SPA shell) — so a new deploy is picked up immediately;
    //  - API requests (/api/*) — so freshly ingested/tagged data shows up immediately instead
    //    of returning a stale (e.g. empty) response cached for ~24h.
    const wantsHtml = (request.headers.get('Accept') ?? '').includes('text/html');
    const isApi = new URL(request.url).pathname.startsWith('/api/');
    const skipCache = wantsHtml || isApi;

    if (!skipCache && request.headers.get('Cache-Control') !== 'no-cache') {
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
            console.info('Cache hit', cacheKey);
            return cachedResponse;
        }
    }
    const response = await next();

    // Don't store the SPA shell or API responses (see above). Hashed static assets still cache.
    const isHtml = (response.headers.get('Content-Type') ?? '').includes('text/html');

    if (response.status === 200 && !isHtml && !isApi) {
        console.log('Caching response', cacheKey);
        await cache.put(cacheKey, response.clone());
    }

    return response;
}
