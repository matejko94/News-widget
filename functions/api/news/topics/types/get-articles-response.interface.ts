export interface GetArticlesResponse {
    categoryAggr: {
        results: {
            label: string;
            count: number;
        }[];
    }
}
