import fetch from "node-fetch";

export class ApiRequest {
    private baseUrl: string = process.env.API_URL as string;
    private headers?: Record<string, any> = {
        "Content-Type": "application/json"
    };

    constructor(headers?: Record<string, any>) {
        this.headers = { ...this.headers, ...headers };
    }

    async makeRequest(url: string, method: ApiRequestMethods, body?: ApiBodyRequest): Promise<Record<string, any>> {
        try{
            const result = await fetch(`${this.baseUrl}${url}`, {
                method,
                headers: this.headers,
                body: this.parseBody(body)
            });
            const json = await result.json();
            return json;
        }catch(error: any){
            throw new Error(error);
        }
    }

    parseBody(body: Record<string, any> | undefined) {
        if (body) {
            return JSON.stringify(body);
        }
    }
}


export enum ApiRequestMethods {
    GET = "GET",
    POST = "POST",
    DELETE = "DELETE"
}

export interface ApiBodyRequest {
    candidateId: string;
    row: number;
    column: number;
}