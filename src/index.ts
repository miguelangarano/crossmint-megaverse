import { Queue } from 'async-await-queue';
import dotenv from 'dotenv';
import { CurrentMap, CurrentMapMatrix } from './models/CurrentMap';
import { State } from './models/State';
import { cleanComeths, cleanPolyanets, cleanSoloons, generateGoalMap, getRandomNumber, validateResponse } from './utils/utils';


dotenv.config();
let state: State;

function init() {
    const myq = new Queue(2, 500);
    const myq2 = new Queue(1, 500);
    state = new State();
    state.eventEmitter.on('astralAdded', async () => {
        console.log('Data Received', state.createdAstralsNumber, state.expectedAstralsNumber);
        if (state.createdAstralsNumber >= state.expectedAstralsNumber) {
            await validateResponse(myq2, state, init);
        }
    });
    generateGoalMap(state, myq, init);
}

async function clean() {
    const currentMap: CurrentMap = new CurrentMap();
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    cleanSoloons(currentMapMatrix);
}




init();
//clean();