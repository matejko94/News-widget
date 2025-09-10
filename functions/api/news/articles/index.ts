import { HttpClient } from '../../../common/http/http-client';
import { Env } from '../../../env';
import { ElasticNewsItem, ElasticNewsItemDto } from './interface/elastic-news-item';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const sdg = searchParams.get('sdg');
    const date = searchParams.get('date');
    const pilot = searchParams.get('pilot');


    if (!date) {
        return new Response('Missing one of queryParameters: date', { status: 400 });
    }

    if (pilot === null && sdg === null || pilot === undefined && sdg === undefined) {
        return new Response('pilot and sdg cannot both be null', { status: 400 });
    }

    const response = await getArticles(
        env.ELASTIC_MEDIA_SEARCH_URL,
        env.ELASTIC_CREDENTIALS,
        sdg,
        pilot,
        new Date(date),
    );

    return new Response(JSON.stringify(response));
}

async function getArticles(url: string, apiKey: string, sdg: string, pilot: string, date: Date): Promise<ElasticNewsItem[]> {
    const filters: any[] = [
        {
            range: {
                dateTimePub: {
                    gte: date.toISOString(),
                    lt: new Date(new Date(date).setDate(date.getDate() + 1)).toISOString(),
                }
            }
        },
    ]

    if (sdg !== '0' && sdg !== null && sdg !== undefined && !isNaN(Number(sdg))) {
        filters.push({
            match: {
                'SDG.keyword': `SDG ${ sdg }`
            }
        });
    } else if (pilot !== '0' && pilot !== null && pilot !== undefined) {
        filters.push({
            match: {
                'pilot.keyword': pilot
            }
        })
    }
    console.log(filters);
    const response = await HttpClient.post(url, {
        body: JSON.stringify({
            size: 10000,
            query: {
                bool: {
                    must: filters
                }
            }
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + apiKey
        }
    });

    const body = await response.json() as { hits: { hits: ElasticNewsItemDto[] } };
    console.log(body);
    console.log(url)
    return body.hits.hits.map(item => item._source);
}
