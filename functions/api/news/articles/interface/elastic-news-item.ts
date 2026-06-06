export interface ElasticNewsItem {
    body: string;
    lang: string;
    location?: {
        type: string;
        label?: {
            eng: string;
        };
        country?: {
            label: {
                eng: string;
            };
        };
    } | null;
    pilot: string[ ];
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
