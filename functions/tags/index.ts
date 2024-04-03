interface Env {
    ENDPOINT: string;
}

export const onRequest: PagesFunction<Env> = async ({request, env}) => {
    const cache = await caches.default;
    const key = request.url;
    let response = await cache.match(key);

    console.log('response', response, "key", key, "request", request, "env", env);

    if (response) {
        console.log("cache hit");
        return response;
    }

    console.log(env.ENDPOINT)

    console.log("cache miss ");
    return fetch(env.ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(({status}) => {
        response.headers.set('Cache-Control', 'max-age=86400, public');
        cache.put(key, response.clone());

        const newResponse = new Response(response.body, {status});
        newResponse.headers.set('Cache-Control', 'max-age=86400, public');
        return newResponse;
    }).catch(({message}) => new Response(JSON.stringify({message}), {status: 500}));
}
