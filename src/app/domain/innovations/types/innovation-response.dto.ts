import { IndustryLinkDto } from './industr-link.dto';
import { IndustryNodeDto } from './industry-node.dto';

export interface InnovationResponseDto {
    nodes: IndustryNodeDto[];
    links: IndustryLinkDto[];
}
