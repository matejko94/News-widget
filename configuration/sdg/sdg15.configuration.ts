import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG15_CONFIGURATION: SdgConfiguration = {
    id: 15,
    color: '#4CAE50',
    erId: 'b96e82e4-892d-4654-84ab-7f1a5ca5019c',
    topics: [
        {
            name: 'Deforestation',
            wikiConcepts: ['Deforestation', 'Clearcutting', 'Defaunation'],
        },
        {
            name: 'Biodiversity Conservation',
            wikiConcepts: ['Biodiversity', 'Life', 'Ecosystem diversity'],
        },
        {
            name: 'Land Degradation',
            wikiConcepts: ['Land Degradation', 'Land management', 'Surface runoff'],
        },
        {
            name: 'Reforestation',
            wikiConcepts: ['Forest management', 'Reforestation', 'Forest'],
        },
        {
            name: 'Ecosystem Restoration',
            wikiConcepts: ['Ecological restoration', 'Ecosystem service', 'Carbon sequestration'],
        },
        {
            name: 'Wildlife Conservation',
            wikiConcepts: ['Wildlife conservation', 'Wildlife', 'Habitat destruction'],
        },
        {
            name: 'Desertification',
            wikiConcepts: ['Desertification', 'Land degradation', 'Biodiversity loss'],
        },
        {
            name: 'Protected Areas',
            wikiConcepts: ['Protected Areas', 'Nature reserve', 'Nature conservation', 'Forest reserve'],
        },
        {
            name: 'Sustainable Forestry',
            wikiConcepts: ['Sustainable Forestry', 'Forestry', 'Woodland'],
        },
        {
            name: 'Soil Health',
            wikiConcepts: ['Soil health', 'Soil resilience', 'Soil fertility'],
        }
    ],
    indicators: [
        {
            name: 'Bird species, threatened',
        },
        {
            name: 'Forest area (%)',
        },
        {
            name: 'Forest area (km2)',
        },
        {
            name: 'Forest rents',
        },
        {
            name: 'Mammal species, threatened',
        },
        {
            name: 'Plant species',
        },
        {
            name: 'Terrestrial protected areas',
        }
    ]
};
