import dotenv from 'dotenv';
import EventEmitter from 'events';
import { generateGoalMapSync, sleep, validateResponseSync } from './utils/utils';

dotenv.config();

async function init() {
    const event: EventEmitter = new EventEmitter();
    //triggers when finished of creating all astrals in API
    event.on('finishedCreation', async () => {
        await sleep(1000);
        console.log("VERIFYING CREATION");
        const valid = await validateResponseSync();

        
        //If the validation response is undefined means there's no valid request
        //so sleep to avoid too many requests issue and trigger event once more
        if(valid==undefined){
            await sleep(1000);
            event.emit('finishedCreation');
        }


        //If validation response is false means that although all API requests were made
        //not all of them were created so we must restart the new current map state
        if(valid==false){
            console.log("RESTARTING CREATION");
            init();
        }
        console.log("CREATION FINISHED SUCCESSFULLY");
        return;
    });
    await generateGoalMapSync(event, init);
}


init();