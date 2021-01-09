import { Injectable, EventEmitter } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {


  ignoreList: string[]=[];

  constructor() { }

  removeFromIgnoreList(selectionToRemove: string) {
    var selectionPosition: number;
    this.ignoreList.forEach( (selectionInList, index) => {

      if(selectionInList == selectionToRemove){
        selectionPosition = index;
      }

    });

    this.ignoreList.splice(selectionPosition, 1);
  }

  addToIgnoreList(selection: string) {
    this.ignoreList.push(selection);
  }

  displayIgnoreList(){
    console.log("MATCHES IN IGNORE LIST: ");

    this.ignoreList.forEach(selection =>{
      console.log(selection);
    })
  }

  getIgnoreList(): string[]{
    console.log(this.ignoreList);

    return this.ignoreList;

  }

}

// TODO: NEED TO LINK JUICYMATCHOBJ.IGNORE TO SERVICE.
