import { ApiBodyRequest, ApiRequest, ApiRequestMethods } from "./ApiRequest";
import { AstralBodies, AstralColors, AstralDirection, IAstral } from "../interfaces/IAstral";
import { IMegaverse } from "../interfaces/IMegaverse";

const polyanetsUrl = "/polyanets";
const soloonsUrl = "/soloons";
const comethsUrl = "/comeths";

export class Astral implements IMegaverse, IAstral {
    candidateId: string = process.env.CANDIDATE_ID as string;
    row: number;
    column: number;
    type: AstralBodies
    color?: AstralColors;
    direction?: AstralDirection;

    constructor(row: number, column: number, type: AstralBodies, color: AstralColors | undefined, direction: AstralDirection | undefined){
        this.row = row;
        this.column = column;
        this.type = type;
        this.color = color;
        this.direction = direction;
    }

    private async astralRequest(method: ApiRequestMethods){
        const request = new ApiRequest();
        const properties: IAstral = {
            row: this.row,
            column: this.column,
            ...(this.color!=undefined && {color: this.color.toLowerCase() as AstralColors}),
            ...(this.direction!=undefined && {direction: this.direction.toLowerCase() as AstralDirection}),
        }
        const bodyRequest: ApiBodyRequest = {
            candidateId: this.candidateId,
            ...properties
        }
        const response: Record<string,any> = request.makeRequest(this.getAstralUrl(), method, bodyRequest);
        return response;
    }

    private getAstralUrl(): string{
        switch(this.type){
            case AstralBodies.POLYANET:
                return polyanetsUrl;
            case AstralBodies.SOLOON:
                return soloonsUrl;
            case AstralBodies.COMETH:
                return comethsUrl;
            default:
                return "";
        }
    }

    async createAstral(): Promise<Record<string,any>>{
        const response = await this.astralRequest(ApiRequestMethods.POST);
        return response;
    }

    async deleteAstral(): Promise<Record<string,any>>{
        const response = await this.astralRequest(ApiRequestMethods.DELETE);
        return response;
    }
}