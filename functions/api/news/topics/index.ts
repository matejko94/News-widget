import { TopicDto } from '../../../../src/app/domain/news/types/topic.dto';
import { HttpClient } from '../../../common/http/http-client';
import { Env } from '../../../env';
import { GetArticlesResponse } from './types/get-articles-response.interface';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const topics = searchParams.get('topics').split(',');

    if (!topics.length) {
        return new Response('Missing one of queryParameters: topics', { status: 400 });
    }

    const returnedTopics = await getTopics(
        env.EVENT_REGISTRY_ARTICLES_URL,
        env.EVENT_REGISTRY_API_KEY,
        topics
    );

    return new Response(JSON.stringify({ topics: returnedTopics }));
}

async function getTopics(url: string, apiKey: string, topics: string[]): Promise<TopicDto[]> {
    console.log({topics})
    const response = await HttpClient.post(url, {
        body: JSON.stringify({
                'apiKey': apiKey,
                'resultType': 'categoryAggr',
                'categoryAggrSortBy': 'date',
                'query': {
                    '$query': {
                        '$and': topics.map(t => ({ conceptUri: createConceptUri(t) }))
                    },
                    '$filter': {
                        'forceMaxDataTimeWindow': '31'
                    }
                },
            }, null, 2),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data: GetArticlesResponse = await response.json();
    console.log(data);
    return data.categoryAggr.results.map(({ label, count }) => ({ label: cleanLabels(label), count }));
}

function createConceptUri(topic: string): string {
    const slug = topic.toLowerCase().replaceAll(' ', '_');
    const firstUpperCase = slug.charAt(0).toUpperCase() + slug.slice(1);

    return `http://en.wikipedia.org/wiki/${ firstUpperCase }`;
}

function cleanLabels(label: string) {
    return label.replace(/^(news\/|dmoz\/)/, '');
}
