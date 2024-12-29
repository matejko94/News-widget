import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG3_CONFIGURATION:SdgConfiguration = {
    id: 3,
    color: '#4CAE50',
    topics: [
        {
            name: 'Rare Diseases',
            wikiConcepts: [ 'Biomedical sciences', 'Rare disease', 'Orphan drugs', 'Orphanet', '9q34.3 deletion syndrome', 'Angelman syndrome', 'Dravet syndrome', 'Cornelia de Lange syndrome', 'Fragile X syndrome', 'Rett syndrome', 'Kabuki syndrome', 'Prader–Willi syndrome' ],
            openAlexCategory: 'Rare disease'
        },
        {
            name: 'Communicable Diseases',
            wikiConcepts: [ 'Epidemiology', 'AIDS', 'Infection', 'Infectious diseases (medical specialty)', 'COVID-19', 'Ebola', 'Influenza', 'Hepatitis', 'Mpox', 'Tuberculosis' ],
            openAlexCategory: 'Clinical epidemiology'
        },
        {
            name: 'Non-communicable Diseases',
            wikiConcepts: [ 'Diabetes', 'Asthma', 'Arthritis', 'Cardiovascular disease', 'Osteoporosis', 'Cancer', 'Alzheimer\'s disease', 'Non-communicable Diseases' ],
            openAlexCategory: 'Non-communicable disease'
        },
        {
            name: 'Maternal Health',
            wikiConcepts: [ 'Maternal health', 'preconception', 'pregnancy', 'childbirth', 'Reproductive health', 'Complications of pregnancy' ],
            openAlexCategory: 'Maternal health'
        },
        {
            name: 'Vaccination Policy',
            wikiConcepts: [ 'Vaccination', 'Vaccination policy', 'Vaccination schedule' ],
            openAlexCategory: 'Vaccination policy'
        },
        {
            name: 'Public Healthcare',
            wikiConcepts: [ 'MEDLINE', 'Health system', 'Health care', 'Health equity', 'Health human resources', 'Health insurance', 'Primary care', 'Universal Healthcare', 'Access to Medicine' ],
            openAlexCategory: 'Public healthcare'
        },
        {
            name: 'Cancer Research',
            wikiConcepts: [ 'Cancer', 'Cancer screening', 'Cancer treatment', 'Epidemiology of cancer', 'Oncology', 'Cancer research' ],
            openAlexCategory: 'Cancer research'
        },
        {
            name: 'Mental Health',
            wikiConcepts: [ 'Mental health', 'Mental disorder', 'Mental environment', 'Emotional resilience', 'Social stigma' ],
            openAlexCategory: 'Mental health'
        },
        {
            name: 'Public Health',
            wikiConcepts: [ 'Public health', 'Air contamination', 'Air pollution', 'Global Health Initiatives' ],
            openAlexCategory: 'Public health policy'
        },
        {
            name: 'Tropical Disease',
            wikiConcepts: [ 'Tropical disease', 'Tropical medicine', 'Lassa fever', 'Marburg virus', 'Dengue fever', 'Malaria' ],
            openAlexCategory: 'Tropical disease'
        }
    ]
}
