export interface ElasticNewsItem {
    body: string;
    lang: string;
    location: null;
    pilot: string[ ];
    UNESCO_region?: string;
    sentiment: number;
    title: string;
    url: string;
    dateTime: string;
    concepts: {
        uri: string;
        type: string;
        score: number;
        label: {
            eng: string;
        }
    }[]
}

export interface ElasticNewsItemDto {
    _source: ElasticNewsItem;
}
