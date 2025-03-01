import { IndustryEdgeDto } from './industry-edge.dto';
import { IndustryNodeDto } from './industry-node.dto';

export interface IndustryCollaborationResponseDto {
    nodes: IndustryNodeDto[];
    edges: IndustryEdgeDto[];
}
