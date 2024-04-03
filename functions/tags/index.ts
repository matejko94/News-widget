interface Env {
    ENDPOINT: string;
    TOKEN: string;
}

export const onRequest: PagesFunction<Env> = async ({request, env}) => {
    const key = new Request(new URL(request.url).toString(), request);
    let response = await caches.default.match(key);

    console.log('response', response, "key", key, "request", request, "env", env);

    if (response) {
        return response;
    }

    return fetch(env.ENDPOINT, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${ btoa(env.TOKEN) }`,
        },
        body: request.body,
    }).then(({status}) => new Response(JSON.stringify(response), {status}))
        .catch(({message}) => new Response(JSON.stringify({message}), {status: 500}));
}
