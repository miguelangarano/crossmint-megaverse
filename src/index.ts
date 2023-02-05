import dotenv from 'dotenv';
import { CurrentMap, CurrentMapMatrix } from './models/CurrentMap';
import { cleanComeths, cleanPolyanets, cleanSoloons, generateGoalMap } from './utils/utils';


dotenv.config();

function init(){
    generateGoalMap();
}

async function clean(){
    const currentMap: CurrentMap = new CurrentMap();
    const currentMapMatrix: CurrentMapMatrix = await currentMap.getCurrentMap();
    cleanSoloons(currentMapMatrix);
}




init();
//clean();