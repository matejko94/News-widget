import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG14_CONFIGURATION: SdgConfiguration = {
    id: 14,
    color: '#4CAE50',
    topics: [
        {
            name: 'Marine Ecosystems',
            wikiConcepts: ['Marine Life', 'Freshwater ecosystem', 'Marine ecosystem'],
        },
        {
            name: 'Ocean Conservation',
            wikiConcepts: ['Oceans', 'Marine conservation', 'Marine resources'],
        },
        {
            name: 'Fisheries',
            wikiConcepts: ['Fishery', 'Aquaculture', 'Overfishing'],
        },
        {
            name: 'Marine Pollution',
            wikiConcepts: ['Marine pollution', 'Invasive species', 'Plasticosis'],
        },
        {
            name: 'Marine Biodiversity',
            wikiConcepts: ['Marine Biodiversity', 'Ocean AND Biodiversity', 'Marine habitat'],
        },
        {
            name: 'Sustainable Fishing',
            wikiConcepts: ['Sustainable fishery', 'Population dynamics of fisheries', 'Sustainable yield in fisheries'],
        },
        {
            name: 'Ocean Acidification',
            wikiConcepts: ['Ocean acidification', 'Marine biogenic calcification', 'Estuarine acidification'],
        },
        {
            name: 'Coral Reefs',
            wikiConcepts: ['Coral reef', 'Coral', 'Deep-water coral', 'Sponge reef'],
        },
        {
            name: 'Marine Resources',
            wikiConcepts: ['Marine resources', 'Marine energy', 'Human impact on marine life', 'Effects of climate change on oceans'],
        },
        {
            name: 'Coastal Protection',
            wikiConcepts: ['Marine coastal ecosystem', 'Coastal management', 'Coastal erosion'],
        }
    ]
};
