interface CountryTimeline {
    name: string;
    code: string;
    timeline: {
        year: number;
        value: number;
    }[]
}

export interface IndicatorIntersectionTimeline {
    indicator: string;
    countries: CountryTimeline[]
}
