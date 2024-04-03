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
    }).then(response => {
        const clonedResponse = response.clone();
        clonedResponse.headers.set('Cache-Control', 'max-age=86400, public');
        cache.put(key, clonedResponse.clone());

        const newResponse = new Response(response.body, {status: response.status});
        newResponse.headers.set('Cache-Control', 'max-age=86400, public');
        return newResponse;
    }).catch(err => {
        console.error(err);
        return new Response(JSON.stringify(err), {status: 500})
    });
}
