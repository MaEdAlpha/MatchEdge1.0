import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {


  ignoreList: string[]=[];
  private watchSubject = new Subject<any>();
  private groupSubject = new Subject<any>();
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

  //called at matchTable on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    this.watchSubject.next(selection);
  }
  getMatchWatchStatus(): Observable<any>{
    return this.watchSubject.asObservable();
  }

  watchGroupSubject( masterGroup: any) {
    this.groupSubject.next(masterGroup);
  }

  getMasterGroup(): Observable<any>{
    return this.groupSubject.asObservable();
  }

}
