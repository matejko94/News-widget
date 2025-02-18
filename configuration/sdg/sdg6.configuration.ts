import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG6_CONFIGURATION: SdgConfiguration = {
    id: 6,
    color: '#4CAE50',
    topics: [
        {
            name: 'Water Access',
            wikiConcepts: ['Water supply', 'Water-use efficiency', 'Groundwater'],
        },
        {
            name: 'Sanitation & Hygiene',
            wikiConcepts: ['Sanitation', 'Water AND Hygiene', 'Water Sanitation'],
        },
        {
            name: 'Water-borne Disease',
            wikiConcepts: ['Waterborne disease', 'Escherichia coli', 'Salmonella enterica', 'Polyomavirus infection', 'Desmodesmus'],
        },
        {
            name: 'Wastewater Management',
            wikiConcepts: ['Reclaimed water', 'Desalination', 'Wastewater treatment'],
        },
        {
            name: 'Clean Drinking Water',
            wikiConcepts: ['Drinking water', 'Drinking water quality standards', 'Safe Drinking Water'],
        },
        {
            name: 'Water Scarcity',
            wikiConcepts: ['Drought', 'Water scarcity', 'Water security'],
        },
        {
            name: 'Water Resource Management',
            wikiConcepts: ['Water storage', 'Water resources', 'Water Resource Management', 'Integrated Water Resources Management'],
        },
        {
            name: 'Water Quality',
            wikiConcepts: ['Water quality', 'Water quality law', 'Water quality modelling'],
        },
        {
            name: 'Water Policy',
            wikiConcepts: ['Water rights', 'Water politics', 'Water Regulations Advisory Scheme'],
        },
        {
            name: 'Water Pollution',
            wikiConcepts: ['Water Pollution', 'Water AND Contamination', 'Aquatic toxicology'],
        }
    ]
};
