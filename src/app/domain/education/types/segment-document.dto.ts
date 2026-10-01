/** One lecture behind a radial segment, from /education/intersection/documents. */
export interface SegmentDocumentDto {
    id: string;
    title: string;
    url?: string | null;
    slug?: string | null;
    description?: string | null;
    date?: string | null;
    /** Seconds. */
    duration?: number | null;
    views?: number | null;
    event_id?: number | null;
    event_title?: string | null;
    authors?: string[];
    sdgs?: string[];
    pilots?: string[];
}

/** One page of the documents counted in a radial segment (topic × SDG / topic × pilot). */
export interface SegmentDocumentsDto {
    topic: string;
    key: string;
    /** Total in the segment — matches the value the radial shows for it. */
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
    /** Documents the backend dropped (no title, no url); counted out of `total`. */
    excluded_count: number;
    documents: SegmentDocumentDto[];
}
