import {Env} from "../common/interface/env";
import {checkRequired} from "../common/validation/check-required";

export const onRequest: PagesFunction<Env> = async ({request, env}) => {
    const {searchParams} = new URL(request.url);
    const cache = caches.default;
    const key = request.url;
    let response = await cache.match(key);

    if (response) {
        return response;
    }

    const sdg = searchParams.get('sdg');
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort');

    const {missing} = checkRequired({sdg, limit, sort});

    if (missing.length) {
        return new Response(`Missing queryParameters: ${missing}`, {status: 400});
    }

    return fetch(`${env.ENDPOINT}&uri=${topicKey}`, {
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

        return newResponse;
    }).catch(err => {
        console.error(err);
        return new Response(JSON.stringify(err), {status: 500})
    });
}
