import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG4_CONFIGURATION: SdgConfiguration = {
    id: 4,
    color: '#4CAE50',
    topics: [
        {
            name: 'Lifelong Learning',
            wikiConcepts: ['Continuing education', 'adult education', 'Community education', 'Lifelong learning', 'Part-time student', 'Professional learning community'],
        },
        {
            name: 'Education Policy',
            wikiConcepts: ['Education policy', 'Early Childhood Education Act', 'Education AND Legislation', 'Board of education', 'Universal Primary Education', 'Quality Education', 'Gender Equality in Education'],
        },
        {
            name: 'Digital Literacy',
            wikiConcepts: ['Youth empowerment', 'Digital literacy', 'Data literacy'],
        },
        {
            name: 'Inclusive Education',
            wikiConcepts: ['Education AND Accessibility', 'Education AND Equity', 'Education AND Inclusion', 'Education AND Immigrants', 'Education AND Migrants', 'Education AND Open file format', 'Equal Education', 'Student financial aid', 'Early Childhood Development'],
        },
        {
            name: 'Teacher Training',
            wikiConcepts: ['Teacher education', 'European Teacher Education Network', 'Teaching method', 'Vocational Training'],
        },
        {
            name: 'Educational Technology',
            wikiConcepts: ['Educational technology', 'Education AND Innovation'],
        },
        {
            name: 'Open Education',
            wikiConcepts: ['Nonformal learning', 'Open education', 'Open educational resources', 'Free education', 'Education AND Open access'],
        },
        {
            name: 'Distance Education',
            wikiConcepts: ['Nonformal learning', 'Global Citizenship', 'Distance education'],
        },
        {
            name: 'Capacity Building',
            wikiConcepts: ['Professional development', 'Capacity building', 'Coursework', 'Competency building'],
        },
        {
            name: 'Special Education',
            wikiConcepts: ['Special Education', 'Disability studies', 'Early childhood intervention', 'special needs', 'learning disabilities'],
        }
    ]
};
