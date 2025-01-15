export interface IntersectingPolicyDto {
    sdg: string,
    total_count: number,
    sdg_intersections: SdgIntersection[]
}

export interface SdgIntersection {
    key: string,
    value: number
}
