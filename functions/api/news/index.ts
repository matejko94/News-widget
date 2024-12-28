import { Env } from '../../../env';
import { ElasticCloudTagResponse } from './interface/elastic-cloud-tag-response.interface';
import { Tag } from './interface/tag.interface';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const sdg = searchParams.get('sdg');
    const keywords = searchParams.get('keywords');

    if (!sdg || !keywords) {
        return new Response('Missing one of queryParameters: sdg, keywords', { status: 400 });
    }

    const tags = await getCloudData(
        env.EVENT_REGISTRY_MEDIA_SEARCH_URL,
        env.EVENT_REGISTRY_API_KEY,
        sdg,
        wikify(keywords.split(','))
    );

    return new Response(JSON.stringify({ tags }));
}

function wikify(keywords: string[]) {
    return keywords
        .map(keyword => keyword.replace(' ', '_').toLowerCase())
        .map(keyword => keyword.charAt(0).toUpperCase() + keyword.slice(1));
}

async function getCloudData(url: string, credentials: string, sdg: string, keywords: string[]): Promise<News[]> {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            size: 0,
            query: {
                bool: {
                    must: [
                        {
                            range: {
                                date: {
                                    gte: startDate.toISOString(),
                                    lt: endDate.toISOString()
                                }
                            }
                        },
                        {
                            match: {
                                'SDG.keyword': `SDG ${ sdg }`
                            }
                        }
                    ]
                }
            },
            aggs: {
                concept_labels: {
                    terms: {
                        field: 'concepts.label.eng.keyword',
                        size: limit,
                        order: {
                            _count: 'desc'
                        }
                    }
                }
            }
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + credentials,
        },
    });

    const data: ElasticCloudTagResponse = await response.json();

    return data.aggregations.concept_labels.buckets.map(bucket => ({
        text: bucket.key,
        weight: bucket.doc_count,
    }));
}
