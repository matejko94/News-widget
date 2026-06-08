export const cacheControlMiddleware: PagesFunction = async ({ request, next }) => {
    const response = await next();

    if (response.status === 200) {
        const contentType = response.headers.get('Content-Type') ?? '';
        const isApi = new URL(request.url).pathname.startsWith('/api/');

        if (isApi || contentType.includes('text/html')) {
            // The SPA shell (index.html / navigations) must always revalidate, otherwise a
            // deploy stays invisible for up to a day because the old shell keeps pointing at
            // the old hashed JS bundles. The bundles themselves are content-hashed, so the
            // long cache below is safe for them.
            response.headers.set('Cache-Control', 'no-cache');
        } else {
            response.headers.set('Cache-Control', 'public, max-age=86400');
        }
    }

    return response;
};
