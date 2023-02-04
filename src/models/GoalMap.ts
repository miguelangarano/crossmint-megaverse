import { AstralBodies } from "../interfaces/IAstral";
import { IMegaverse } from "../interfaces/IMegaverse";
import { ApiRequest, ApiRequestMethods } from "./ApiRequest";

export class GoalMap implements IMegaverse {
    candidateId: string = process.env.CANDIDATE_ID as string;

    constructor(){}

    async getGoalMap(): Promise<GoalMapMatrix>{
        const request = new ApiRequest();
        const response: GoalMapMatrix = await request.makeRequest(`/map/${this.candidateId}/goal`, ApiRequestMethods.GET) as GoalMapMatrix;
        return response;
    }
}


export interface GoalMapMatrix {
    goal: AstralBodies[][];
}