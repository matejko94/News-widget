export const corsMiddleware: PagesFunction = async ({ request, next }) => {
    const response = await next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (request.method !== 'OPTIONS') {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
};
