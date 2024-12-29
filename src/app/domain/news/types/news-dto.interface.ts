import { NewsItem } from "./news-item.interface";

export interface NewsDto {
    hits: {
        hits: NewsItem[]
    }
}
