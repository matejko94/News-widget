export interface ElasticCloudTagResponse {
    aggregations: {
        concept_labels: {
         buckets: [
             {
                 key: string,
                 doc_count: number
             }
         ]
        }
    }
}