import { Env } from '../../../env';
import { ElasticCloudTagResponse } from './interface/elastic-cloud-tag-response.interface';
import { Tag } from './interface/tag.interface';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const startDate = new Date(searchParams.get('startDate'));
    const endDate = new Date(searchParams.get('endDate'));
    const sdg = searchParams.get('sdg');
    const limit = searchParams.get('limit');
    const pilot = searchParams.get('pilot');
    // or pilot or sdg both cannot be null
    if (pilot === null && sdg === null || pilot === undefined && sdg === undefined) {
        return new Response('pilot and sdg cannot both be null', { status: 400 });
    }

    if (!startDate || !endDate || !limit) { 
        return new Response('Missing one of queryParameters: startDate, endDate, limit', { status: 400 });
    }

    const tags = await getCloudData(
        env.ELASTIC_MEDIA_SEARCH_URL,
        env.ELASTIC_CREDENTIALS,
        sdg,
        pilot,
        startDate,
        endDate,
        +limit
    );

    return new Response(JSON.stringify({ tags }));
}

async function getCloudData(url: string, credentials: string, sdg: string, pilot: string, startDate: Date, endDate: Date, limit: number): Promise<Tag[]> {
    const filters: any = [
        {
            range: {
                date: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString()
                }
            }
        },
    ];

    console.log(sdg, pilot);

    if (sdg !== '0' && sdg !== null && sdg !== undefined && !isNaN(Number(sdg))) {
        filters.push({
            match: {
                'SDG.keyword': `SDG ${ sdg }`
            }
        });
    }else if (pilot !== '0' && pilot !== null && pilot !== undefined) {
        filters.push({
            match: {
                'pilot.keyword': pilot
            }
        })
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            size: 0,
            query: {
                bool: {
                    must: filters
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
    console.log(data, filters);
    return data.aggregations.concept_labels.buckets.map(bucket => ({
        text: bucket.key,
        weight: bucket.doc_count,
    }));
}
