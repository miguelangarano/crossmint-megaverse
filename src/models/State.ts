import { EventEmitter } from 'events';
import { Astral } from './Astral';

export class State {
    expectedAstralsNumber: number;
    createdAstralsNumber: number;
    eventEmitter: EventEmitter = new EventEmitter();

    constructor(){
        this.expectedAstralsNumber = 0;
        this.createdAstralsNumber = 0;
    }

    setExpectedAstrals(value: number){
        this.expectedAstralsNumber = value;
    }

    addCreatedAstral(){
        this.createdAstralsNumber += 1;
    }

    clearState(){
        this.expectedAstralsNumber = 0;
        this.createdAstralsNumber = 0;
    }


}