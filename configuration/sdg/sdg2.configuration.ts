import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG2_CONFIGURATION: SdgConfiguration = {
    id: 2,
    color: '',
    topics: [
        {
            name: 'Food Security',
            wikiConcepts: [ 'Food Bank', 'Food security', 'Famine', 'Global Food Security Index', 'Doha Development Round', 'Food policy' ],
        },
        {
            name: 'Malnutrition',
            wikiConcepts: [ 'Malnutrition', 'nutrients AND deficiency', 'Underweight', 'Food desert' ],
        },
        {
            name: 'Agricultural Productivity',
            wikiConcepts: [ 'Land law', 'Agricultural productivity', 'Agroforestry' ],
        },
        {
            name: 'Sustainable Farming',
            wikiConcepts: [ 'Biofertilizer', 'Crop diversity', 'Sustainable agriculture', 'Agroecology' ],
        },
        {
            name: 'Food policy',
            wikiConcepts: [ 'Agricultural value chain', 'Agribusiness', 'Bioeconomy', 'Food policy' ],
        },
        {
            name: 'Rural Development',
            wikiConcepts: [ 'Land law', 'Agricultural Land Reserve', 'Agricultural economics' ],
        },
        {
            name: 'Smallholder Farmers',
            wikiConcepts: [ 'Agricultural Orientation index', 'Smallholding', 'World Food Programme' ],
        },
        {
            name: 'Food Systems',
            wikiConcepts: [ 'Food system', 'Food industry', 'Food Standards Agency', 'foodborne illness', 'Food technology' ],
        },
        {
            name: 'Zero Hunger',
            wikiConcepts: [ 'Hunger', 'Universal Declaration on the Eradication of Hunger and Malnutrition', 'Zero Hunger' ],
        },
        {
            name: 'Resilient Agriculture',
            wikiConcepts: [ 'Genetically Modified Food', 'Climate-smart agriculture', 'Genetically Modified Crops', 'Biofortification' ],
        },
    ],
    indicators: [
        {
            name: 'Agriculture, forestry, and fishing, value added per worker',
        },
        {
            name: 'Capture fisheries production',
        },
        {
            name: 'Total fisheries production',
        },
        {
            name: 'Cereal yield',
        },
    ]
}
