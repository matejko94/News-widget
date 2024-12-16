import {ElasticCloudTagResponse} from "./interface/elastic-cloud-tag-response.interface";
import {Tag} from "./interface/tag.interface";
import {Env} from "../../../env";

export const onRequestGet: PagesFunction<Env> = async ({request, env}) => {
    const searchParams = new URL(request.url).searchParams;

    const startDate = new Date(searchParams.get('startDate'));
    const endDate = new Date(searchParams.get('endDate'));
    const sdg = searchParams.get('sdg');
    const limit = searchParams.get('limit');

    if (!startDate || !endDate || !sdg || !limit) {
        return new Response('Missing one of queryParameters: startDate, endDate, sdg, limit', {status: 400});
    }

    const tags = await getCloudData(
        env.ELASTIC_MEDIA_SEARCH_URL,
        env.ELASTIC_CREDENTIALS,
        sdg,
        startDate,
        endDate,
        +limit
    );

    return new Response(JSON.stringify({tags}));
}

async function getCloudData(url: string, credentials: string, sdg: string, startDate: Date, endDate: Date, limit: number): Promise<Tag[]> {
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
                                "SDG.keyword": `SDG ${sdg}`
                            }
                        }
                    ]
                }
            },
            aggs: {
                concept_labels: {
                    terms: {
                        field: "concepts.label.eng.keyword",
                        size: limit,
                        order: {
                            _count: "desc"
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
