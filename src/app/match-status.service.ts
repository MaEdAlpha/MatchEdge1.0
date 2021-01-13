import { Injectable, EventEmitter } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {


  ignoreList: string[]=[];
  private watchSubject = new Subject<any>();
  allSelections: any[];

  constructor() { }

  //IGNORE STATUS
  // TODO: NEED TO MAKE OBSERVABLES
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


  //WATCHLIST STATUS

  //called at JuicyMatches on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    this.watchSubject.next(selection);
  }
  getMatchWatchStatus(): Observable<any>{
    return this.watchSubject.asObservable();
  }


}
