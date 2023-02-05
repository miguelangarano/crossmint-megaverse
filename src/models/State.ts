import { EventEmitter } from 'events';

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
        this.eventEmitter.emit('astralAdded');
    }

    clearState(){
        this.expectedAstralsNumber = 0;
        this.createdAstralsNumber = 0;
    }


}