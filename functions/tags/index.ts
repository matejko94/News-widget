interface Env {
    ENDPOINT: string;
}

export const onRequest: PagesFunction<Env> = async ({request, env}) => {
    const key = new Request(new URL(request.url).toString(), request);
    let response = await caches.default.match(key);

    console.log('response', response, "key", key, "request", request, "env", env);

    if (response) {
        console.log("cache hit");
        return response;
    }

    console.log(env.ENDPOINT)

    console.log("cache miss");
    return fetch(env.ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(({status}) => new Response(JSON.stringify(response), {status}))
        .catch(({message}) => new Response(JSON.stringify({message}), {status: 500}));
}
