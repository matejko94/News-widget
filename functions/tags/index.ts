interface Env {
    ENDPOINT: string;
}

export const onRequest: PagesFunction<Env> = async ({request, env}) => {
    const cache = caches.default;
    const key = request.url;
    let response = await cache.match(key);

    console.log('response', response, "key", key, "request", request, "env", env);

    if (response) {
        console.log("cache hit");
        return response;
    }
    console.log("cache miss ");

    const topicKey = new URL(request.url).searchParams.get('topicKey');

    if (!topicKey) {
        return new Response('Missing queryParameter: topicKey', {status: 400});
    }

    return fetch(`${ env.ENDPOINT }&uri=${ topicKey }`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (response) => {
        const clonedResponse = response.clone();
        const newResponse = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            headers: {
                'Cache-Control': 'max-age=86400, public',
                'Access-Control-Allow-Origin': '*',
            }
        });
        await cache.put(key, newResponse.clone());
        console.log("cached", await cache.match(key));
        return newResponse;
    }).catch(err => {
        console.error(err);
        return new Response(JSON.stringify(err), {status: 500})
    });
}
