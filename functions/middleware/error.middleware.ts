export const errorMiddleware: PagesFunction = async ({ next }) => {
    try {
        return await next();
    } catch (e) {
        console.error('Error while handling request', e);
        return new Response(e.message, { status: 500 });
    }
}
