import { ScienceItem } from "./science-item.interface";

export interface ScienceDto {
    aggregations: {
        countries: {
            doc_count_error_upper_bound: number;
            sum_other_doc_count: number;
            buckets: ScienceItem[];

        }
    }
}
