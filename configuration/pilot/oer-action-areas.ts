/**
 * The five OER action areas, and the aggregate pilot that shows all of them at once.
 *
 * OER-all still exists as its own data stream in Elastic, but the news widget builds it from
 * the five action areas instead (their union, with articles that belong to several areas shown
 * once and labelled with each area they match).
 */
export const OER_ALL_PILOT = 'OER-all';

export const OER_ACTION_AREAS = [ 'OER1', 'OER2', 'OER3', 'OER4', 'OER5' ] as const;

export type OerActionArea = typeof OER_ACTION_AREAS[number];

/**
 * Human-readable names for the five action areas. The article labels stay as the short OER1..OER5
 * codes — most articles match four areas at once, and four full names would outgrow the headline
 * they sit under — so these are surfaced as the label's tooltip instead.
 */
export const OER_ACTION_AREA_NAMES: Record<OerActionArea, string> = {
    OER1: 'Capacity Building',
    OER2: 'Supportive Policy',
    OER3: 'Inclusive Access',
    OER4: 'Sustainable Models',
    OER5: 'International Cooperation',
};

/**
 * Chip colours for the action-area labels shown next to each article. Pale backgrounds with a
 * same-hue dark text keep the labels readable inline next to the publication date; the hues
 * follow the per-area `color` in pilot.configurationt.ts.
 */
export const OER_ACTION_AREA_STYLES: Record<OerActionArea, { background: string, color: string }> = {
    OER1: { background: '#E3F0F9', color: '#14557F' },
    OER2: { background: '#E1F5F8', color: '#0F6C78' },
    OER3: { background: '#E2F8F1', color: '#12705A' },
    OER4: { background: '#FFF6DD', color: '#7A5A00' },
    OER5: { background: '#FFEEDF', color: '#8A4409' },
};

/**
 * The action areas an article belongs to, in a stable OER1..OER5 order.
 *
 * Elastic returns a single-valued `pilot` field as a bare string rather than an array, so
 * normalise before matching.
 */
export function oerActionAreasOf(pilot: string[] | string | undefined | null): OerActionArea[] {
    const pilots = Array.isArray(pilot) ? pilot : (pilot ? [ pilot ] : []);
    const normalized = new Set(pilots.map(entry => (entry ?? '').trim().toUpperCase()));

    return OER_ACTION_AREAS.filter(area => normalized.has(area));
}
