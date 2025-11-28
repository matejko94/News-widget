import { Injectable } from '@angular/core';
import { LANDSLIDES_CONFIGURATION } from '../../../../../configuration/sdg/landslides.configuration';
import { SDG1_CONFIGURATION } from '../../../../../configuration/sdg/sdg1.configuration';
import { SDG10_CONFIGURATION } from '../../../../../configuration/sdg/sdg10.configuration';
import { SDG11_CONFIGURATION } from '../../../../../configuration/sdg/sdg11.configuration';
import { SDG12_CONFIGURATION } from '../../../../../configuration/sdg/sdg12.configuration';
import { SDG13_CONFIGURATION } from '../../../../../configuration/sdg/sdg13.configuration';
import { SDG14_CONFIGURATION } from '../../../../../configuration/sdg/sdg14.configuration';
import { SDG15_CONFIGURATION } from '../../../../../configuration/sdg/sdg15.configuration';
import { SDG16_CONFIGURATION } from '../../../../../configuration/sdg/sdg16.configuration';
import { SDG17_CONFIGURATION } from '../../../../../configuration/sdg/sdg17.configuration';
import { SDG2_CONFIGURATION } from '../../../../../configuration/sdg/sdg2.configuration';
import { SDG3_CONFIGURATION } from '../../../../../configuration/sdg/sdg3.configuration';
import { SDG4_CONFIGURATION } from '../../../../../configuration/sdg/sdg4.configuration';
import { SDG5_CONFIGURATION } from '../../../../../configuration/sdg/sdg5.configuration';
import { SDG6_CONFIGURATION } from '../../../../../configuration/sdg/sdg6.configuration';
import { SDG7_CONFIGURATION } from '../../../../../configuration/sdg/sdg7.configuration';
import { SDG8_CONFIGURATION } from '../../../../../configuration/sdg/sdg8.configuration';
import { SDG9_CONFIGURATION } from '../../../../../configuration/sdg/sdg9.configuration';
import { SdgConfiguration } from '../types/sdg-configuration.interface';
import { AI_MOVEMENT_CONFIGURATION, COP30_CONFIGURATION, ELIAS_CONFIGURATION, LANDSLIDES_PILOT_CONFIGURATION, OBIA1_CONFIGURATION, OBIA2_CONFIGURATION, OBIA3_CONFIGURATION, OER1_CONFIGURATION, OER2_CONFIGURATION, OER3_CONFIGURATION, OER4_CONFIGURATION, OER5_CONFIGURATION, QUANTUM_CONFIGURATION, RAD_CONFIGURATION } from '../../../../../configuration/pilot/pilot.configurationt';

@Injectable({
    providedIn: 'root'
})
export class Configuration {

    public get(sdg: string): SdgConfiguration {
        switch (sdg) {
            case '0':
                return LANDSLIDES_CONFIGURATION;
            case '1':
                return SDG1_CONFIGURATION;
            case '2':
                return SDG2_CONFIGURATION;
            case '3':
                return SDG3_CONFIGURATION;
            case '4':
                return SDG4_CONFIGURATION;
            case '5':
                return SDG5_CONFIGURATION;
            case '6':
                return SDG6_CONFIGURATION;
            case '7':
                return SDG7_CONFIGURATION;
            case '8':
                return SDG8_CONFIGURATION;
            case '9':
                return SDG9_CONFIGURATION;
            case '10':
                return SDG10_CONFIGURATION;
            case '11':
                return SDG11_CONFIGURATION;
            case '12':
                return SDG12_CONFIGURATION;
            case '13':
                return SDG13_CONFIGURATION;
            case '14':
                return SDG14_CONFIGURATION;
            case '15':
                return SDG15_CONFIGURATION;
            case '16':
                return SDG16_CONFIGURATION;
            case '17':
                return SDG17_CONFIGURATION;
            case 'COP30':
                return COP30_CONFIGURATION;
            case 'ELIAS':
                return ELIAS_CONFIGURATION;
            case 'Landslides':
                return LANDSLIDES_PILOT_CONFIGURATION;
            case 'OER1':
                return OER1_CONFIGURATION;
            case 'OER2':
                return OER2_CONFIGURATION;
            case 'OER3':
                return OER3_CONFIGURATION;
            case 'OER4':
                return OER4_CONFIGURATION;
            case 'OER5':
                return OER5_CONFIGURATION;
            case 'OBIA1':
                return OBIA1_CONFIGURATION;
            case 'OBIA2':
                return OBIA2_CONFIGURATION;
            case 'OBIA3':
                return OBIA3_CONFIGURATION;
            case 'AImovement':
                return AI_MOVEMENT_CONFIGURATION;
            case 'RaD':
                return RAD_CONFIGURATION;
            case 'Quantum':
                return QUANTUM_CONFIGURATION;
            default:
                throw new Error(`No configuration found for SDG ${sdg}`);
        }
    }
}
