import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG6_CONFIGURATION: SdgConfiguration = {
    id: 6,
    color: '#4CAE50',
    topics: [
        {
            name: 'Water Access',
            wikiConcepts: ['Water supply', 'Water-use efficiency', 'Groundwater'],
            openAlexCategory: 'Water supply'
        },
        {
            name: 'Sanitation & Hygiene',
            wikiConcepts: ['Sanitation', 'Water AND Hygiene', 'Water Sanitation'],
            openAlexCategory: 'Sanitation'
        },
        {
            name: 'Water-borne Disease',
            wikiConcepts: ['Waterborne disease', 'Escherichia coli', 'Salmonella enterica', 'Polyomavirus infection', 'Desmodesmus'],
            openAlexCategory: 'Escherichia coli'
        },
        {
            name: 'Wastewater Management',
            wikiConcepts: ['Reclaimed water', 'Desalination', 'Wastewater treatment'],
            openAlexCategory: 'Wastewater'
        },
        {
            name: 'Clean Drinking Water',
            wikiConcepts: ['Drinking water', 'Drinking water quality standards', 'Safe Drinking Water'],
            openAlexCategory: 'Clean water'
        },
        {
            name: 'Water Scarcity',
            wikiConcepts: ['Drought', 'Water scarcity', 'Water security'],
            openAlexCategory: 'Water scarcity'
        },
        {
            name: 'Water Resource Management',
            wikiConcepts: ['Water storage', 'Water resources', 'Water Resource Management', 'Integrated Water Resources Management'],
            openAlexCategory: 'Water resource management'
        },
        {
            name: 'Water Quality',
            wikiConcepts: ['Water quality', 'Water quality law', 'Water quality modelling'],
            openAlexCategory: 'Water quality'
        },
        {
            name: 'Water Policy',
            wikiConcepts: ['Water rights', 'Water politics', 'Water Regulations Advisory Scheme'],
            openAlexCategory: 'Water right'
        },
        {
            name: 'Water Pollution',
            wikiConcepts: ['Water Pollution', 'Water AND Contamination', 'Aquatic toxicology'],
            openAlexCategory: 'Water pollution'
        }
    ]
};
