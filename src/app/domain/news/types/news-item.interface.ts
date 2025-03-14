export interface NewsResponse {
    articles: {
        results: NewsItem[];
    }
}

export interface NewsItem {
    lang: string;
    dateTime: string;
    url: string;
    title: string;
    body: string;
    concepts: {
        uri: string;
    }[];
    sentiment: number | null;
    location?: {
        type: string,
        label?: {
            eng: string
        }
        country?: {
            label: {
                eng: string
            }
        }
    } | null
}
