import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG4_CONFIGURATION: SdgConfiguration = {
    id: 4,
    color: '#4CAE50',
    topics: [
        {
            name: 'Lifelong Learning',
            wikiConcepts: ['Continuing education', 'adult education', 'Community education', 'Lifelong learning', 'Part-time student', 'Professional learning community'],
            openAlexCategory: 'Lifelong learning'
        },
        {
            name: 'Education Policy',
            wikiConcepts: ['Education policy', 'Early Childhood Education Act', 'Education AND Legislation', 'Board of education', 'Universal Primary Education', 'Quality Education', 'Gender Equality in Education'],
            openAlexCategory: 'Education policy'
        },
        {
            name: 'Digital Literacy',
            wikiConcepts: ['Youth empowerment', 'Digital literacy', 'Data literacy'],
            openAlexCategory: 'Digital literacy'
        },
        {
            name: 'Inclusive Education',
            wikiConcepts: ['Education AND Accessibility', 'Education AND Equity', 'Education AND Inclusion', 'Education AND Immigrants', 'Education AND Migrants', 'Education AND Open file format', 'Equal Education', 'Student financial aid', 'Early Childhood Development'],
            openAlexCategory: 'Multicultural education'
        },
        {
            name: 'Teacher Training',
            wikiConcepts: ['Teacher education', 'European Teacher Education Network', 'Teaching method', 'Vocational Training'],
            openAlexCategory: 'Teacher education'
        },
        {
            name: 'Educational Technology',
            wikiConcepts: ['Educational technology', 'Education AND Innovation'],
            openAlexCategory: 'Educational technology'
        },
        {
            name: 'Open Education',
            wikiConcepts: ['Nonformal learning', 'Open education', 'Open educational resources', 'Free education', 'Education AND Open access'],
            openAlexCategory: 'Open education'
        },
        {
            name: 'Distance Education',
            wikiConcepts: ['Nonformal learning', 'Global Citizenship', 'Distance education'],
            openAlexCategory: 'Distance education'
        },
        {
            name: 'Capacity Building',
            wikiConcepts: ['Professional development', 'Capacity building', 'Coursework', 'Competency building'],
            openAlexCategory: 'Capacity building'
        },
        {
            name: 'Special Education',
            wikiConcepts: ['Special Education', 'Disability studies', 'Early childhood intervention', 'special needs', 'learning disabilities'],
            openAlexCategory: 'Special education'
        }
    ]
};
