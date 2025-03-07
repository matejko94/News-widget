export interface EventSdgsDto {
    sdgs: string[];
    events: {
        id: number;
        title: string;
    }[],
    similarities: {
        source: number;
        target: number;
        similarity: number;
    } []
}
