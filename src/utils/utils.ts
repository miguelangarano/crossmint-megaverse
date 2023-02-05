import { AstralBodies, AstralBodiesCurrent, AstralColors, AstralDirection, IAstral } from "../interfaces/IAstral";
import { CurrentMap, CurrentMapMatrix } from "../models/CurrentMap";
import { GoalMap, GoalMapMatrix } from "../models/GoalMap";
import { State } from "../models/State";
import { Astral } from "../models/Astral";
import { Queue } from "async-await-queue";

const myPriority = -1;

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

export async function createAstralsToGoalMap(astrals: IAstral[], state: State, myq: Queue) {
    for (let astral of astrals) {
        const type = getAstralType(astral);
        switch (type) {
            case AstralBodies.POLYANET: {
                await generateAstralsToGoalMap({
                    ...astral,
                    type,
                }, state, myq);
            }
            case AstralBodies.SOLOON: {
                await generateAstralsToGoalMap({
                    ...astral,
                    type,
                    color: getAstralProperty(astral) as AstralColors
                }, state, myq);
            }
            case AstralBodies.COMETH: {
                await generateAstralsToGoalMap({
                    ...astral,
                    type,
                    direction: getAstralProperty(astral) as AstralDirection
                }, state, myq);
            }
        }
    }
    await myq.flush();
}

export async function generateAstralsToGoalMap(astral: IAstral, state: State, myq: Queue) {
    const newAstral: Astral = new Astral(astral.row, astral.column, astral.type as AstralBodies, astral.color, astral.direction);
    await handleAstralCreation(newAstral, state, myq);
}

export async function handleAstralCreation(astral: Astral, state: State, myq: Queue) {

    const me = Symbol();
    await myq.wait(me, myPriority);

    console.log(`${astral.type} STARTING at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`);
    try {
        const response = await astral.createAstral();
        console.log("FINALIZED ASTRAL")
        myq.end(me);
        state.addCreatedAstral();
        state.eventEmitter.emit("astralAdded");
        console.log("ENDED", `${astral.type} at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`)
        await myq.flush();
        console.log(`${astral.type} RESPONSE at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`, response);
    } catch (e) {
        console.log("ERRORED ASTRAL", e)
    }
}

export async function generateGoalMap(state: State, myq: Queue, restartFunction: Function) {
    const goalMap: GoalMap = new GoalMap();
    const mapMatrix: GoalMapMatrix = await goalMap.getGoalMap();
    const currentMap: CurrentMap = new CurrentMap();
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    if (currentMapMatrix == undefined || currentMapMatrix?.content == undefined) {
        restartFunction();
        return;
    }
    const astrals: IAstral[] = getMissingAstralsCoordinates(mapMatrix, currentMapMatrix);
    state.setExpectedAstrals(astrals.length);
    console.log("ASTRALS::", astrals)
    createAstralsToGoalMap(astrals, state, myq);
}

export function getRandomNumber() {
    return Math.floor(Math.random() * (2500 - 1000 + 1) + 1000);
}

export function getAstralProperty(astral: IAstral): string {
    const type = getAstralType(astral);
    if (type == AstralBodies.SPACE || type == AstralBodies.POLYANET) {
        return "";
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

export async function validateResponse(myq: Queue, state: State, restartFunction: Function) {
    const me = Symbol();
    await myq.wait(me, myPriority);
    const answer = await new CurrentMap().validateAnswer().catch((e) => console.log(e)).finally(() => {
        myq.end(me);
        console.log("VALIDATION ENDED")
    });

    await myq.flush();
    if (answer == undefined) {
        state.eventEmitter.emit("validation");
        return;
    }
    if (answer == true) {
        return;
    }
    state.eventEmitter.removeAllListeners();
    state.clearState();
    restartFunction();

}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}