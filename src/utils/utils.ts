import { AstralBodies, AstralBodiesCurrent, AstralColors, AstralDirection, IAstral } from "../interfaces/IAstral";
import { Astral } from "../models/Astral";
import { CurrentMap, CurrentMapMatrix } from "../models/CurrentMap";
import { GoalMap, GoalMapMatrix } from "../models/GoalMap";
import { State } from "../models/State";

export async function generateGoalMapSync(state: State, resetFunction: Function) {
    const goalMap: GoalMap = new GoalMap();
    const mapMatrix: GoalMapMatrix = await goalMap.getGoalMap();
    const currentMap: CurrentMap = new CurrentMap();
    await sleep(1000);
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    if (currentMapMatrix == undefined) {
        resetFunction();
        return;
    }
    const astrals: IAstral[] = getMissingAstralsCoordinates(mapMatrix, currentMapMatrix);
    createAstralsToGoalMap(astrals, state);
}

export function getMissingAstralsCoordinates(goalMap: GoalMapMatrix, currentMap: CurrentMapMatrix): IAstral[] {
    const missingAstralsCoordinates: IAstral[] = [];
    goalMap.goal?.forEach((rows, i) => {
        rows.forEach((columns, j) => {
            if (currentMap?.content?.[i][j]?.type == null && columns != AstralBodies.SPACE) {
                missingAstralsCoordinates.push({ type: columns, row: i, column: j });
            }
        })
    });
    return missingAstralsCoordinates;
}

export async function createAstralsToGoalMap(astrals: IAstral[], state: State) {
    for (let astral of astrals) {
        const type = getAstralType(astral);
        await generateAstralsToGoalMap({
            ...astral,
            type,
            color: getAstralProperty(astral) as AstralColors,
            direction: getAstralProperty(astral) as AstralDirection
        });
    }
    state.eventEmitter.emit("finishedCreation");
}

export async function generateAstralsToGoalMap(astral: IAstral) {
    const newAstral: Astral = new Astral(astral.row, astral.column, astral.type as AstralBodies, astral.color, astral.direction);
    try {
        const response = await newAstral.createAstral();
        console.log(`Created ${astral.type} at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`, response)
    } catch (e) {
        console.log("ERRORED ASTRAL", e)
    }
}

export function getAstralProperty(astral: IAstral): string | undefined {
    const type = getAstralType(astral);
    if (type == AstralBodies.SPACE || type == AstralBodies.POLYANET) {
        return undefined;
    }
    return astral.type?.split("_")[0].toLowerCase() ?? "";
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


export function cleanPolyanets(currentMapMatrix: CurrentMapMatrix) {
    currentMapMatrix.content.forEach((element, i) => {
        element.forEach((item, j) => {
            if (item?.type === AstralBodiesCurrent.POLYANET) {
                const astral: Astral = new Astral(i, j, AstralBodies.POLYANET, undefined, undefined);
                handleAstralDeletion(astral)
            }
        })
    })
}

export function cleanSoloons(currentMapMatrix: CurrentMapMatrix) {
    currentMapMatrix.content.forEach((element, i) => {
        element.forEach((item, j) => {
            if (item?.type === AstralBodiesCurrent.SOLOON) {
                const astral: Astral = new Astral(i, j, AstralBodies.SOLOON, undefined, undefined);
                handleAstralDeletion(astral)
            }
        })
    })
}

export function cleanComeths(currentMapMatrix: CurrentMapMatrix) {
    currentMapMatrix.content.forEach((element, i) => {
        element.forEach((item, j) => {
            if (item?.type === AstralBodiesCurrent.COMETH) {
                const astral: Astral = new Astral(i, j, AstralBodies.COMETH, undefined, undefined);
                handleAstralDeletion(astral)
            }
        })
    })
}

function handleAstralDeletion(astral: Astral) {
    astral.deleteAstral().then((response) => {
        if (response.reason != undefined && response.reason == "Too Many Requests. Try again later.") {
            handleAstralsDeleteQueueRequests(astral);
        } else {
            console.log(`${astral.type} DELETED at: ${astral.row},${astral.column}`, response);
        }
    }).catch(() => {
        handleAstralsDeleteQueueRequests(astral);
    })
}

function handleAstralsDeleteQueueRequests(astral: Astral) {
    setTimeout(() => {
        handleAstralDeletion(astral);
    }, getRandomNumber());
}


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomNumber() {
    return Math.floor(Math.random() * (2500 - 1000 + 1) + 1000);
}