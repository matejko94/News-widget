interface Env {
    ENDPOINT: string;
    TOKEN: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const key = new Request( new URL(request.url).toString(), request);
        let response = await caches.default.match(key);

        if (response) {
            return response;
        }

        return fetch(env.ENDPOINT, {
            headers: {
                Authorization: `Bearer ${ env.TOKEN }`,
            },
        }).then(({status}) => new Response(JSON.stringify(response), {status}))
            .catch(({message}) => new Response(JSON.stringify({message}), {status: 500}));
    }
}