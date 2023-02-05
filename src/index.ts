import { Queue } from 'async-await-queue';
import dotenv from 'dotenv';
import { CurrentMap, CurrentMapMatrix } from './models/CurrentMap';
import { State } from './models/State';
import { generateGoalMapSync, validateResponseSync } from './utils/chunkutils';
import { cleanComeths, cleanPolyanets, cleanSoloons, generateGoalMap, sleep, validateResponse } from './utils/utils';


dotenv.config();

async function init() {
    const state = new State();
    console.log("STATE::", state)
    state.eventEmitter.on('finishedCreation', async () => {
        console.log('Data Received', state.createdAstralsNumber, state.expectedAstralsNumber);
        await sleep(1000);
        const valid = await validateResponseSync();
        if(valid==undefined){
            await sleep(1000);
            state.eventEmitter.emit('finishedCreation');
        }
        if(valid==false){
            init();
        }
        return;
    });
    await generateGoalMapSync(state, init);
}

async function clean() {
    const currentMap: CurrentMap = new CurrentMap();
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    cleanPolyanets(currentMapMatrix);
}




init();
//clean();