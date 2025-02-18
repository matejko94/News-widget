import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG16_CONFIGURATION: SdgConfiguration = {
    id: 16,
    color: '#4CAE50',
    topics: [
        {
            name: 'Rule of Law',
            wikiConcepts: ['Rule of Law', 'Legal certainty', 'Public interest law'],
        },
        {
            name: 'Human Rights',
            wikiConcepts: ['Human Rights', 'Right to life', 'Freedom of speech', 'Right to education'],
        },
        {
            name: 'Justice',
            wikiConcepts: ['Justice', 'Court', 'Social contract'],
        },
        {
            name: 'Transparency',
            wikiConcepts: ['Transparency (behavior)', 'Openness', 'Open standard'],
        },
        {
            name: 'Anti-Corruption',
            wikiConcepts: ['Anti-Corruption', 'Regulatory compliance', 'Professional ethics', 'Bribery'],
        },
        {
            name: 'Strong Institutions',
            wikiConcepts: ['Strong AND Institution', 'Cultural reproduction', 'Value (ethics)'],
        },
        {
            name: 'Accountability',
            wikiConcepts: ['Accountability', 'Legal liability', 'Strict liability'],
        },
        {
            name: 'Conflict Resolution',
            wikiConcepts: ['Peace', 'Conflict Resolution'],
        },
        {
            name: 'Autonomy',
            wikiConcepts: ['Freedom', 'Liberty', 'Autonomy'],
        },
        {
            name: 'Inclusivity',
            wikiConcepts: ['Social exclusion', 'Ostracism', 'Social rejection', 'Social vulnerability'],
        }
      ]
};
