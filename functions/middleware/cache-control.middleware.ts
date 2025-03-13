export const cacheControlMiddleware: PagesFunction = async ({ next }) => {
    const response = await next();

    if (response.status === 200) {
        response.headers.set('Cache-Control', 'public, max-age=86400');
    }

    return response;
};
