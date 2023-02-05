import { AstralBodies, AstralBodiesCurrent } from "../interfaces/IAstral";
import { Astral } from "../models/Astral";
import { CurrentMapMatrix } from "../models/CurrentMap";
import { getRandomNumber } from "./utils";

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