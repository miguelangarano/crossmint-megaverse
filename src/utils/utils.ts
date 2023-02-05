import EventEmitter from "events";
import { AstralBodies, AstralColors, AstralDirection, IAstral } from "../interfaces/IAstral";
import { Astral } from "../models/Astral";
import { CurrentMap, CurrentMapMatrix } from "../models/CurrentMap";
import { GoalMap, GoalMapMatrix } from "../models/GoalMap";

export async function generateGoalMapSync(event: EventEmitter, resetFunction: Function) {
    const goalMap: GoalMap = new GoalMap();
    const mapMatrix: GoalMapMatrix = await goalMap.getGoalMap();
    const currentMap: CurrentMap = new CurrentMap();


    //sleep to avoid too many api requests when getting the maps
    await sleep(1000);
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();


    //If there was an error querying currentmap then restart
    if(currentMapMatrix==undefined){
        resetFunction();
        return;
    }
    const astrals: IAstral[] = getMissingAstralsCoordinates(mapMatrix, currentMapMatrix);
    createAstralsToGoalMap(astrals, event);
}

export function getMissingAstralsCoordinates(goalMap: GoalMapMatrix, currentMap: CurrentMapMatrix): IAstral[] {
    const missingAstralsCoordinates: IAstral[] = [];
    const map = goalMap.goal;

    //maps the goal matrix
    for(let i=0; i<map.length; i++){
        for(let j=0; j<map[i].length; j++){
            
            //check if the goal is not a empty cell and if current map is an empty cell
            //if this conditions match, means that we need to add an astral to the current map
            if (currentMap?.content?.[i][j]?.type == null && map[i][j] != AstralBodies.SPACE) {
                missingAstralsCoordinates.push({ type: map[i][j], row: i, column: j });
            }
        }
    }
    return missingAstralsCoordinates;
}

export async function createAstralsToGoalMap(astrals: IAstral[], event: EventEmitter) {
    for (let astral of astrals) {
        const type = getAstralType(astral);


        //creates the astral in the endpoint
        await generateAstralsToGoalMap({
            ...astral,
            type,
            color: getAstralProperty(astral) as AstralColors,
            direction: getAstralProperty(astral) as AstralDirection
        });
    }


    //notifies event listener that we finished calling API for every missing astral
    event.emit("finishedCreation");
}

export async function generateAstralsToGoalMap(astral: IAstral) {
    const newAstral: Astral = new Astral(astral.row, astral.column, astral.type as AstralBodies, astral.color, astral.direction);
    try {
        const response = await newAstral.createAstral();
        console.log(`CREATED ${astral.type} at: ${astral.row},${astral.column}`, response)
    } catch (e) {
        console.log("ERRORED ASTRAL", e)
    }
}

export function getAstralProperty(astral: IAstral): AstralColors | AstralDirection | undefined {
    const type = getAstralType(astral);
    if(type == AstralBodies.SOLOON){
        return astral.type?.split("_")[0].toLowerCase() as AstralColors;
    }else if(type == AstralBodies.COMETH){
        return astral.type?.split("_")[0].toLowerCase() as AstralDirection;
    }
    return undefined;
}

export function getAstralType(astral: IAstral): AstralBodies {
    if (astral.type == AstralBodies.SPACE || astral.type == AstralBodies.POLYANET) {
        return astral.type;
    } else if (astral.type?.includes(AstralBodies.SOLOON)) {
        return AstralBodies.SOLOON;
    } else if (astral.type?.includes(AstralBodies.COMETH)) {
        return AstralBodies.COMETH;
    }
    return AstralBodies.SPACE;
}

export async function validateResponseSync() {
    const answer = await new CurrentMap().validateAnswer();
    if (answer == undefined) {
        return undefined;
    }
    if (answer == true) {
        return true;
    }
    return false;

}


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomNumber() {
    return Math.floor(Math.random() * (2500 - 1000 + 1) + 1000);
}