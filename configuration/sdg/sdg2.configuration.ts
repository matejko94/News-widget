import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG2_CONFIGURATION: SdgConfiguration = {
    id: 2,
    color: '',
    topics: [
        {
            name: 'Food Security',
            wikiConcepts: [ 'Food Bank', 'Food security', 'Famine', 'Global Food Security Index', 'Doha Development Round', 'Food policy' ],
            openAlexCategory: 'Food security'
        },
        {
            name: 'Malnutrition',
            wikiConcepts: [ 'Malnutrition', 'nutrients AND deficiency', 'Underweight', 'Food desert' ],
            openAlexCategory: 'Protein malnutrition'
        },
        {
            name: 'Agricultural Productivity',
            wikiConcepts: [ 'Land law', 'Agricultural productivity', 'Agroforestry' ],
            openAlexCategory: 'Agricultural productivity'
        },
        {
            name: 'Sustainable Farming',
            wikiConcepts: [ 'Biofertilizer', 'Crop diversity', 'Sustainable agriculture', 'Agroecology' ],
            openAlexCategory: 'Sustainable Agriculture'
        },
        {
            name: 'Food policy',
            wikiConcepts: [ 'Agricultural value chain', 'Agribusiness', 'Bioeconomy', 'Food policy' ],
            openAlexCategory: 'Food policy'
        },
        {
            name: 'Rural Development',
            wikiConcepts: [ 'Land law', 'Agricultural Land Reserve', 'Agricultural economics' ],
            openAlexCategory: 'Rural development'
        },
        {
            name: 'Smallholder Farmers',
            wikiConcepts: [ 'Agricultural Orientation index', 'Smallholding', 'World Food Programme' ],
            openAlexCategory: 'Small farm'
        },
        {
            name: 'Food Systems',
            wikiConcepts: [ 'Food system', 'Food industry', 'Food Standards Agency', 'foodborne illness', 'Food technology' ],
            openAlexCategory: 'Food systems'
        },
        {
            name: 'Zero Hunger',
            wikiConcepts: [ 'Hunger', 'Universal Declaration on the Eradication of Hunger and Malnutrition', 'Zero Hunger' ],
            openAlexCategory: 'Food supply'
        },
        {
            name: 'Resilient Agriculture',
            wikiConcepts: [ 'Genetically Modified Food', 'Climate-smart agriculture', 'Genetically Modified Crops', 'Biofortification' ],
            openAlexCategory: 'Biofortification'
        },
    ]
}
