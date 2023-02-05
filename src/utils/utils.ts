import { AstralBodies, AstralBodiesCurrent, AstralColors, AstralDirection, IAstral } from "../interfaces/IAstral";
import { CurrentMap, CurrentMapMatrix } from "../models/CurrentMap";
import { GoalMap, GoalMapMatrix } from "../models/GoalMap";
import { Astral } from "../models/Astral";

export function getMissingAstralsCoordinates(goalMap: GoalMapMatrix): IAstral[] {
    const missingAstralsCoordinates: IAstral[] = [];
    goalMap.goal.forEach((rows, i) => {
        rows.forEach((columns, j) => {
            missingAstralsCoordinates.push({ type: columns, row: i, column: j });
        })
    });
    return missingAstralsCoordinates;
}

export function createAstralsToGoalMap(astrals: IAstral[]) {
    astrals.forEach((astral: IAstral) => {
        const type = getAstralType(astral);
        switch (type) {
            case AstralBodies.POLYANET: {
                generateAstralsToGoalMap({
                    ...astral,
                    type: getAstralType(astral)
                });
            }
            case AstralBodies.SOLOON: {
                generateAstralsToGoalMap({
                    ...astral,
                    type: getAstralType(astral),
                    color: getAstralProperty(astral) as AstralColors
                });
            }
            case AstralBodies.COMETH: {
                generateAstralsToGoalMap({
                    ...astral,
                    type: getAstralType(astral),
                    direction: getAstralProperty(astral) as AstralDirection
                },);
            }
        }
    })
}

export function generateAstralsToGoalMap(astral: IAstral) {
    const newAstral: Astral = new Astral(astral.row, astral.column, astral.type as AstralBodies, astral.color, astral.direction);
    handleAstralCreation(newAstral);
}

function handleAstralCreation(astral: Astral) {
    setTimeout(() => {
        astral.createAstral().then((response) => {
            console.log(`${astral.type} STARTING at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`, response);
            if (response.reason != undefined && response.reason == "Too Many Requests. Try again later.") {
                handleAstralCreation(astral);
            } else if (response.error == true) {
                handleAstralCreation(astral);
            }
            else {
                console.log(`${astral.type} CREATED at: ${astral.row},${astral.column} ${astral.color} ${astral.direction}`, response);
            }
        }).catch(() => {
            handleAstralCreation(astral);
        })
    }, getRandomNumber());
}

export async function generateGoalMap() {
    const goalMap: GoalMap = new GoalMap();
    const mapMatrix: GoalMapMatrix = await goalMap.getGoalMap();
    console.log("GOAL MAP::", mapMatrix);
    const astrals: IAstral[] = getMissingAstralsCoordinates(mapMatrix);
    console.log("ASTRALS::", astrals)
    createAstralsToGoalMap(astrals);
}

export function getRandomNumber() {
    return Math.floor(Math.random() * (2500 - 1000 + 1) + 1000);
}

export function getAstralProperty(astral: IAstral): string {
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
                const astral: Astral = new Astral(i, j, AstralBodies.POLYANET);
                handleAstralDeletion(astral)
            }
        })
    })
}

export function cleanSoloons(currentMapMatrix: CurrentMapMatrix) {
    currentMapMatrix.content.forEach((element, i) => {
        element.forEach((item, j) => {
            if (item?.type === AstralBodiesCurrent.SOLOON) {
                const astral: Astral = new Astral(i, j, AstralBodies.SOLOON);
                handleAstralDeletion(astral)
            }
        })
    })
}

export function cleanComeths(currentMapMatrix: CurrentMapMatrix) {
    currentMapMatrix.content.forEach((element, i) => {
        element.forEach((item, j) => {
            if (item?.type === AstralBodiesCurrent.COMETH) {
                const astral: Astral = new Astral(i, j, AstralBodies.COMETH);
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