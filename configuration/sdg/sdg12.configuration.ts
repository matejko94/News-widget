import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG12_CONFIGURATION: SdgConfiguration = {
    id: 12,
    color: '#4CAE50',
    erId: 'c4d5af06-b9d4-4f28-91a9-148e28c24fb3',
    topics: [
        {
            name: 'Waste Reduction',
            wikiConcepts: [ 'Food loss and waste', 'Waste minimisation' ],
        },
        {
            name: 'Recycling',
            wikiConcepts: [ 'Recycling', 'Reuse', 'Recycling bin', 'Materials recovery facility' ],
        },
        {
            name: 'Sustainable Production',
            wikiConcepts: [ 'Production Patterns', 'Responsible Business' ],
        },
        {
            name: 'Sustainable Consumption',
            wikiConcepts: [ 'Sustainable consumption', 'Anti-consumerism', 'Collaborative consumption', 'Overconsumption (economics)' ],
        },
        {
            name: 'Circular Economy',
            wikiConcepts: [ 'Circular Economy', 'Circular procurement', 'Durable good', 'Sustainable products' ],
        },
        {
            name: 'Resource Efficiency',
            wikiConcepts: [ 'Resource efficiency', 'Ecological efficiency', 'Efficient energy use' ],
        },
        {
            name: 'Consumer Awareness',
            wikiConcepts: [ 'Consumer behaviour', 'Advertising management', 'Predictive buying' ],
        },
        {
            name: 'Supply Chains',
            wikiConcepts: [ 'Supply chain', 'Logistics', 'Supply chain management', 'Supply chain attack' ],
        },
        {
            name: 'Eco-friendly Products',
            wikiConcepts: [ 'Ecological design', 'European Ecodesign Directive', 'Eco-innovation', 'Environmental design' ],
        },
        {
            name: 'Environmental Impact Assessment',
            wikiConcepts: [ 'Environmental impact assessment', 'Environmental issues', 'Strategic environmental assessment' ],
        }
    ],
    indicators: [
        {
            name: 'Annualized growth in per capita real survey mean consumption or income, bottom 40%',
        },
        {
            name: 'Annualized growth in per capita real survey mean consumption or income, total population',
        },
        {
            name: 'General government final consumption expenditure',
        },
        {
            name: 'General government final consumption expenditure',
        },
        {
            name: 'Imports of goods and services',
        },

        {
            name: 'Inflation, consumer prices'
        },
        {
            name: 'Mineral rents',
        },
        {
            name: 'Number of people spending more than 10% of household consumption or income on out-of-pocket health care expenditure',
        },
        {
            name: 'Number of people spending more than 25% of household consumption or income on out-of-pocket health care expenditure',
        },
        {
            name: 'PPP conversion factor, GDP',
        },
        {
            name: 'PPP conversion factor, private consumption',
        },
        {
            name: 'Total alcohol consumption per capita',
        },
        {
            name: 'Total alcohol consumption per capita, female',
        },
        {
            name: 'Total alcohol consumption per capita, male',
        }
    ]
};
