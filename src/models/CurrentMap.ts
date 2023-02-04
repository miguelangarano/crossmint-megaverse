import { AstralBodiesCurrent } from "../interfaces/IAstral";
import { IMegaverse } from "../interfaces/IMegaverse";
import { ApiRequest, ApiRequestMethods } from "./ApiRequest";

export class CurrentMap implements IMegaverse {
    candidateId: string = process.env.CANDIDATE_ID as string;

    constructor(){}

    async getCurrentMap(): Promise<CurrentMapMatrix>{
        const request = new ApiRequest();
        const response: Record<string, any> = await request.makeRequest(`/map/${this.candidateId}`, ApiRequestMethods.GET);
        const matrix: CurrentMapMatrix = response.map;
        return matrix;
    }

    async validateAnswer(): Promise<boolean>{
        const request = new ApiRequest();
        const response: Record<string, any> = await request.makeRequest(`/map/${this.candidateId}/validate`, ApiRequestMethods.POST);
        return response.solved;
    }
}


export interface CurrentMapMatrix {
    content: (null | {type: AstralBodiesCurrent})[][];
}