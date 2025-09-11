import { TopicDto } from '../../../../src/app/domain/news/types/topic.dto';
import { HttpClient } from '../../../common/http/http-client';
import { Env } from '../../../env';
import { GetArticlesResponse } from './types/get-articles-response.interface';

const pilotURIMapped: Record<string, string> = {
    'Lanslides': '10cadf45-7110-4c51-8110-30e3e3848c0f',
    'OER': 'f23b14f7-60d1-4786-9ca4-f8fdd56682ec',
    'OER2': '9365e3e0-4914-41b5-822a-9e373e2fd3fa',
    'OER3': '1ebf4034-deab-452e-a0e4-edf356eb2139',
    'OER4': '50c9b223-8eec-49ee-b6cb-46631ed37dcf',
    'OER5': 'f9d34ef5-0d04-4e2e-8fc7-ade59aef9801',
    'COP30': '3e80057d-779a-4174-9c74-0ea0394d6ac6',
    'ELIAS': '71299589-2ba9-48af-9408-da0d3f704d5f',
}
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const topics = searchParams.get('topics').split(',');
    const pilot = searchParams.get('pilot');
    if (!topics.length) {
        return new Response('Missing one of queryParameters: topics', { status: 400 });
    }

    const returnedTopics = await getTopics(
        env.EVENT_REGISTRY_ARTICLES_URL,
        env.EVENT_REGISTRY_API_KEY,
        topics,
        pilot
    );

    return new Response(JSON.stringify({ topics: returnedTopics }));
}

async function getTopics(url: string, apiKey: string, topics: string[], pilot?: string): Promise<TopicDto[]> {


    const pilotURI = pilotURIMapped[pilot];
    const response = await HttpClient.post(url, {
        body: JSON.stringify({
                'apiKey': apiKey,
                'resultType': 'categoryAggr',
                'categoryAggrSortBy': 'date',
                'query': {
                    '$query': {
                        '$or': !pilotURI ? topics.map(t => ({ conceptUri: createConceptUri(t) })) : [{ conceptUri: pilotURI }]
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


    return data.categoryAggr.results.map(({ label, count }) => ({ label: cleanLabels(label), count }));
}

function createConceptUri(topic: string): string {
    const slug = topic.toLowerCase().replaceAll(' ', '_');
    const firstUpperCase = slug.charAt(0).toUpperCase() + slug.slice(1);

    return `http://en.wikipedia.org/wiki/${ firstUpperCase }`;
}

function createConceptUriPilot(topic: string,pilot: string): string {
    
    const pilots = {
        'Lanslides': '10cadf45-7110-4c51-8110-30e3e3848c0f',
        'OER': 'f23b14f7-60d1-4786-9ca4-f8fdd56682ec',
        'OER2': '9365e3e0-4914-41b5-822a-9e373e2fd3fa',
        'OER3': '1ebf4034-deab-452e-a0e4-edf356eb2139',
        'OER4': '50c9b223-8eec-49ee-b6cb-46631ed37dcf',
        'OER5': 'f9d34ef5-0d04-4e2e-8fc7-ade59aef9801',
        'COP30': '3e80057d-779a-4174-9c74-0ea0394d6ac6',
        'ELIAS': '71299589-2ba9-48af-9408-da0d3f704d5f',
    }
    if (!pilots[pilot]) {
        return createConceptUri(topic);
    }
    return pilots[pilot];
}

function cleanLabels(label: string) {
    return label.replace(/^(news\/|dmoz\/)/, '');
}
