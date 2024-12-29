import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG15_CONFIGURATION: SdgConfiguration = {
    id: 15,
    color: '#4CAE50',
    topics: [
        {
            name: 'Deforestation',
            wikiConcepts: ['Deforestation', 'Clearcutting', 'Defaunation'],
            openAlexCategory: 'Community forestry'
        },
        {
            name: 'Biodiversity Conservation',
            wikiConcepts: ['Biodiversity', 'Life', 'Ecosystem diversity'],
            openAlexCategory: 'Biodiversity conservation'
        },
        {
            name: 'Land Degradation',
            wikiConcepts: ['Land Degradation', 'Land management', 'Surface runoff'],
            openAlexCategory: 'Land degradation'
        },
        {
            name: 'Reforestation',
            wikiConcepts: ['Forest management', 'Reforestation', 'Forest'],
            openAlexCategory: 'Reforestation'
        },
        {
            name: 'Ecosystem Restoration',
            wikiConcepts: ['Ecological restoration', 'Ecosystem service', 'Carbon sequestration'],
            openAlexCategory: 'Ecosystem respiration'
        },
        {
            name: 'Wildlife Conservation',
            wikiConcepts: ['Wildlife conservation', 'Wildlife', 'Habitat destruction'],
            openAlexCategory: 'Wildlife conservation'
        },
        {
            name: 'Desertification',
            wikiConcepts: ['Desertification', 'Land degradation', 'Biodiversity loss'],
            openAlexCategory: 'Desertification'
        },
        {
            name: 'Protected Areas',
            wikiConcepts: ['Protected Areas', 'Nature reserve', 'Nature conservation', 'Forest reserve'],
            openAlexCategory: 'Protected area'
        },
        {
            name: 'Sustainable Forestry',
            wikiConcepts: ['Sustainable Forestry', 'Forestry', 'Woodland'],
            openAlexCategory: 'Agroforestry'
        },
        {
            name: 'Soil Health',
            wikiConcepts: ['Soil health', 'Soil resilience', 'Soil fertility'],
            openAlexCategory: 'Soil health'
        }
      ]
};
