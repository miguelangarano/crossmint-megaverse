import dotenv from 'dotenv';
import { State } from './models/State';
import { generateGoalMapSync, sleep, validateResponseSync } from './utils/utils';


dotenv.config();

async function init() {
    const state = new State();
    state.eventEmitter.on('finishedCreation', async () => {
        await sleep(1000);
        console.log("VERIFYING CREATION");
        const valid = await validateResponseSync();
        if(valid==undefined){
            await sleep(1000);
            state.eventEmitter.emit('finishedCreation');
        }
        if(valid==false){
            console.log("RESTARTING CREATION");
            init();
        }
        console.log("CREATION FINISHED SUCCESSFULLY");
        return;
    });
    await generateGoalMapSync(state, init);
}


init();