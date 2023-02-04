import dotenv from 'dotenv';
import { CurrentMap, CurrentMapMatrix } from './models/CurrentMap';
import { State } from './models/State';
import { cleanComeths, cleanPolyanets, cleanSoloons, generateGoalMap, getRandomNumber } from './utils/utils';


dotenv.config();
let state: State;

function init(){
    state = new State();
    state.eventEmitter.on('astralAdded', () => {
        console.log('Data Received', state.createdAstralsNumber, state.expectedAstralsNumber);
        if(state.createdAstralsNumber>=state.expectedAstralsNumber){
            new CurrentMap().validateAnswer().then((solved)=>{
                console.log("SOLVED::", solved)
                if(solved==undefined){
                    setTimeout(()=>{
                        state.eventEmitter.emit('astralAdded');
                    }, getRandomNumber());
                    return;
                }
                if(solved){
                    return;
                }
                generateGoalMap(state);
            }).catch(()=>{
                state.eventEmitter.emit('astralAdded');
            })
        }
    });
    generateGoalMap(state);
}

async function clean(){
    const currentMap: CurrentMap = new CurrentMap();
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    cleanSoloons(currentMapMatrix);
}




init();
//clean();