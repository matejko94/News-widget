import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG3_CONFIGURATION: SdgConfiguration = {
    id: 3,
    color: '#4CAE50',
    topics: [
        {
            name: 'Rare Diseases',
            wikiConcepts: [ 'Biomedical sciences', 'Rare disease', 'Orphan drugs', 'Orphanet', '9q34.3 deletion syndrome', 'Angelman syndrome', 'Dravet syndrome', 'Cornelia de Lange syndrome', 'Fragile X syndrome', 'Rett syndrome', 'Kabuki syndrome', 'Prader–Willi syndrome' ],
        },
        {
            name: 'Communicable Diseases',
            wikiConcepts: [ 'Epidemiology', 'AIDS', 'Infection', 'Infectious diseases (medical specialty)', 'COVID-19', 'Ebola', 'Influenza', 'Hepatitis', 'Mpox', 'Tuberculosis' ],
        },
        {
            name: 'Non-communicable Diseases',
            wikiConcepts: [ 'Diabetes', 'Asthma', 'Arthritis', 'Cardiovascular disease', 'Osteoporosis', 'Cancer', 'Alzheimer\'s disease', 'Non-communicable Diseases' ],
        },
        {
            name: 'Maternal Health',
            wikiConcepts: [ 'Maternal health', 'preconception', 'pregnancy', 'childbirth', 'Reproductive health', 'Complications of pregnancy' ],
        },
        {
            name: 'Vaccination Policy',
            wikiConcepts: [ 'Vaccination', 'Vaccination policy', 'Vaccination schedule' ],
        },
        {
            name: 'Public Healthcare',
            wikiConcepts: [ 'MEDLINE', 'Health system', 'Health care', 'Health equity', 'Health human resources', 'Health insurance', 'Primary care', 'Universal Healthcare', 'Access to Medicine' ],
        },
        {
            name: 'Cancer Research',
            wikiConcepts: [ 'Cancer', 'Cancer screening', 'Cancer treatment', 'Epidemiology of cancer', 'Oncology', 'Cancer research' ],
        },
        {
            name: 'Mental Health',
            wikiConcepts: [ 'Mental health', 'Mental disorder', 'Mental environment', 'Emotional resilience', 'Social stigma' ],
        },
        {
            name: 'Public Health',
            wikiConcepts: [ 'Public health', 'Air contamination', 'Air pollution', 'Global Health Initiatives' ],
        },
        {
            name: 'Tropical Disease',
            wikiConcepts: [ 'Tropical disease', 'Tropical medicine', 'Lassa fever', 'Marburg virus', 'Dengue fever', 'Malaria' ],
        }
    ],
    indicators: [
        {
            name: 'Mortality rate, neonatal',
        },
        {
            name: 'Births attended by skilled health staff',
        },
        {
            name: 'Prevalence of undernourishment',
        },
        {
            name: 'Adolescent fertility rate',
        },
        {
            name: 'Completeness of birth registration',
        },
        {
            name: 'Completeness of birth registration, female',
        },
        {
            name: 'Completeness of birth registration, male',
        },
        {
            name: 'Completeness of birth registration, rural',
        },
        {
            name: 'Completeness of birth registration, urban',
        },
        {
            name: 'Exclusive breastfeeding',
        },
        {
            name: 'Female genital mutilation prevalence',
        },
        {
            name: 'Immunization, DPT',
        },
        {
            name: 'Immunization, HepB3',
        },
        {
            name: 'Immunization, measles',
        },
        {
            name: 'Incidence of HIV, ages 15 - 49',
        },
        {
            name: 'Incidence of malaria',
        },
        {
            name: 'Incidence of tuberculosis',
        },
        {
            name: 'Maternal mortality ratio',
        },
        {
            name: 'Mortality caused by road traffic injury',
        },
        {
            name: 'Mortality from CVD, cancer, diabetes or CRD between exact ages 30 and 70',
        },
        {
            name: 'Mortality from CVD, cancer, diabetes or CRD between exact ages 30 and 70, female',
        },
        {
            name: 'Mortality from CVD, cancer, diabetes or CRD between exact ages 30 and 70, male',
        },
        {
            name: 'Mortality rate attributed to household and ambient air pollution, age - standardized',
        },
        {
            name: 'Mortality rate attributed to household and ambient air pollution, age - standardized, female',
        },
        {
            name: 'Mortality rate attributed to household and ambient air pollution, age - standardized, male',
        },
        {
            name: 'Mortality rate attributed to unintentional poisoning',
        },
        {
            name: 'Mortality rate attributed to unintentional poisoning, female',
        },
        {
            name: 'Mortality rate attributed to unintentional poisoning, male',
        },
        {
            name: 'Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene',
        },
        {
            name: 'Mortality rate, under - 5',
        },
        {
            name: 'Mortality rate, under - 5, female',
        },
        {
            name: 'Mortality rate, under - 5, male',
        },
        {
            name: 'Nurses and midwives',
        },
        {
            name: 'PM2.5 pollution, population exposed to levels exceeding WHO Interim Target - 1 value',
        },
        {
            name: 'PM2.5 pollution, population exposed to levels exceeding WHO Interim Target - 2 value',
        },
        {
            name: 'PM2.5 pollution, population exposed to levels exceeding WHO Interim Target - 3 value',
        },
        {
            name: 'Prevalence of anemia among women of reproductive age',
        },
        {
            name: 'Prevalence of current tobacco use, females',
        },
        {
            name: 'Prevalence of current tobacco use, males',
        },
        {
            name: 'Prevalence of HIV, female',
        },
        {
            name: 'Prevalence of HIV, male',
        },
        {
            name: 'Prevalence of HIV, total',
        },
        {
            name: 'Prevalence of overweight, weight for height',
        },
        {
            name: 'Prevalence of overweight, weight for height, female',
        },
        {
            name: 'Prevalence of overweight, weight for height, male',
        },
        {
            name: 'Prevalence of severe wasting, weight for height',
        },
        {
            name: 'Prevalence of severe wasting, weight for height, female',
        },
        {
            name: 'Prevalence of severe wasting, weight for height, male',
        },
        {
            name: 'Prevalence of stunting, height for age',
        },
        {
            name: 'Prevalence of stunting, height for age, female',
        },
        {
            name: 'Prevalence of stunting, height for age, male',
        },
        {
            name: 'Prevalence of underweight, weight for age',
        },
        {
            name: 'Prevalence of underweight, weight for age, female',
        },
        {
            name: 'Prevalence of underweight, weight for age, male',
        },
        {
            name: 'Prevalence of wasting, weight for height, female',
        },
        {
            name: 'Prevalence of wasting, weight for height, male',
        },
        {
            name: 'Suicide mortality rate',
        },
        {
            name: 'Suicide mortality rate, female',
        },
        {
            name: 'Suicide mortality rate, male',
        },
    ]
}
