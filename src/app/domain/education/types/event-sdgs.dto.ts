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
 * One event from /education/whitespace. `id` is a legacy VideoLectures id; `date`, `description`
 * and `url` are null when the event has none (see specs/education-whitespace-event-details.md).
 */
export interface EventDto {
    id: number;
    title: string;
    date?: string | null;
    description?: string | null;
    /** Event page on VideoLectures, e.g. https://videolectures.net/events/<slug>. */
    url?: string | null;
}
