export interface EventSdgsDto {
    sdgs: string[];
    events: EventDto[],
    similarities: {
        source: number;
        target: number;
        similarity: number;
    } []
}

/**
 * One event from /education/whitespace. Today the backend sends only `id` (a legacy VideoLectures
 * id) and `title`; the rest is requested in specs/education-whitespace-event-details.md and is
 * shown as soon as it arrives.
 */
export interface EventDto {
    id: number;
    title: string;
    date?: string | null;
    description?: string | null;
    /** Event page on VideoLectures, e.g. https://videolectures.net/events/<slug>. */
    url?: string | null;
}
