import { Option } from '../../src/app/ui/components/menu/menu.component';

/**
 * UNESCO world regions, used by the OER pilot news widget.
 *
 * The values match the `UNESCO_region` field on the news index documents, which
 * is what the article list is filtered by.
 *
 * Source: IRCAI-SDGobservatory/data country_codes/UNESCO-world-regions-sdg.csv
 * (the last column, "UNESCO Regions").
 */
export const UNESCO_REGIONS: Option[] = [
    { label: 'Africa', value: 'Africa' },
    { label: 'Arab States', value: 'Arab States' },
    { label: 'Asia and the Pacific', value: 'Asia and the Pacific' },
    { label: 'Europe and Northern America', value: 'Europe and Northern America' },
    { label: 'Latin America and the Caribbean', value: 'Latin America and the Caribbean' },
];
