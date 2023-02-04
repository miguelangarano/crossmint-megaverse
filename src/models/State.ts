import { EventEmitter } from 'events';
import { Astral } from './Astral';

export class State {
    expectedAstralsNumber: number;
    createdAstralsNumber: number;
    eventEmitter: EventEmitter = new EventEmitter();
    createdAstrals: Queue<Astral>;
    erroredAstrals: Queue<Astral>;

    constructor(){
        this.expectedAstralsNumber = 0;
        this.createdAstralsNumber = 0;
        this.createdAstrals = new Queue();
        this.erroredAstrals = new Queue();
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