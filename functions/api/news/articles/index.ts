import { TopicDto } from '../../../../src/app/domain/news/types/topic.dto';
import { HttpClient } from '../../../common/http/http-client';
import { Env } from '../../../env';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const searchParams = new URL(request.url).searchParams;

    const topicPage = searchParams.get('topicPage');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!topicPage || !startDate || !endDate) {
        return new Response('Missing one of queryParameters: topicPage, startDate, endDate', { status: 400 });
    }

    const response = await getTopics(
        env.EVENT_REGISTRY_TOPIC_PAGE_URL,
        env.EVENT_REGISTRY_API_KEY,
        topicPage,
        startDate,
        endDate
    );

    return new Response(JSON.stringify(response));
}

async function getTopics(url: string, apiKey: string, topicPage: string, startDate: string, endDate: string): Promise<TopicDto[]> {
    const response = await HttpClient.post(url, {
        body: JSON.stringify({
            'apiKey': apiKey,
            'onlyAfterTm': startDate,
            'onlyBeforeTm': endDate,
            'uri': topicPage,
            'resultType': 'articles',
            'articlesSortBy': 'date',
            'articleBodyLen': 50,
            'includeArticleLocation': true,
            'includeArticleConcepts': true,
            'includeArticleImage': false,
            'includeArticleAuthors': false,
        }, null, 2),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return await response.json();
}
