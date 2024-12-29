import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG14_CONFIGURATION: SdgConfiguration = {
    id: 14,
    color: '#4CAE50',
    topics: [
        {
            name: 'Marine Ecosystems',
            wikiConcepts: ['Marine Life', 'Freshwater ecosystem', 'Marine ecosystem'],
            openAlexCategory: 'Marine ecosystem'
        },
        {
            name: 'Ocean Conservation',
            wikiConcepts: ['Oceans', 'Marine conservation', 'Marine resources'],
            openAlexCategory: 'Marine conservation'
        },
        {
            name: 'Fisheries',
            wikiConcepts: ['Fishery', 'Aquaculture', 'Overfishing'],
            openAlexCategory: 'Fisheries law'
        },
        {
            name: 'Marine Pollution',
            wikiConcepts: ['Marine pollution', 'Invasive species', 'Plasticosis'],
            openAlexCategory: 'Marine pollution'
        },
        {
            name: 'Marine Biodiversity',
            wikiConcepts: ['Marine Biodiversity', 'Ocean AND Biodiversity', 'Marine habitat'],
            openAlexCategory: 'Marine biodiversity'
        },
        {
            name: 'Sustainable Fishing',
            wikiConcepts: ['Sustainable fishery', 'Population dynamics of fisheries', 'Sustainable yield in fisheries'],
            openAlexCategory: 'Fisheries management'
        },
        {
            name: 'Ocean Acidification',
            wikiConcepts: ['Ocean acidification', 'Marine biogenic calcification', 'Estuarine acidification'],
            openAlexCategory: 'Ocean acidification'
        },
        {
            name: 'Coral Reefs',
            wikiConcepts: ['Coral reef', 'Coral', 'Deep-water coral', 'Sponge reef'],
            openAlexCategory: 'Coral reef protection'
        },
        {
            name: 'Marine Resources',
            wikiConcepts: ['Marine resources', 'Marine energy', 'Human impact on marine life', 'Effects of climate change on oceans'],
            openAlexCategory: 'Marine biology'
        },
        {
            name: 'Coastal Protection',
            wikiConcepts: ['Marine coastal ecosystem', 'Coastal management', 'Coastal erosion'],
            openAlexCategory: 'Coastal zone'
        }
    ]
};
