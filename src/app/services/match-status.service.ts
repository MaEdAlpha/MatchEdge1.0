import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {
  watchList: any[]=[];
  private watchSubject = new Subject<any>();
  private groupSubject = new Subject<any>();
  allSelections: any[];

  constructor() { }

  //IGNORE STATUS
  // TODO: NEED TO MAKE OBSERVABLES
  //TODO: If Observable is not necessary...do we just filter?
  removeFromWatchList(selectionToRemove: any) {
    var selectionPosition: number;
    this.watchList.forEach( (selectionInList, index) => {

      if(selectionInList == selectionToRemove.Home || selectionInList == selectionToRemove.Away){
        selectionPosition = index;
      }
    });
    this.watchList.splice(selectionPosition, 1);
  }

  addToWatchList(selection: any) {
    this.watchList.push(selection);
  }

  displayIgnoreList(){
    console.log("MATCHES IN IGNORE LIST: ");
    this.watchList.forEach(selection =>{
      console.log(selection);
    })
  }

  getWatchList(): any[]{
    console.log(this.watchList);
    return this.watchList;
  }

  isWatched( selection:string):boolean {
    const matchIsWatched = this.watchList.filter( fixture => {
      if(fixture.Home == selection) {
        return true;
      }
      if(fixture.Away == selection) {
        return true;
      }
    })
    return matchIsWatched.length != 0 ? true : false;
  }

  //WATCHLIST STATUS

  //called at matchTable on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    this.watchSubject.next(selection);

    selection.isWatched ? this.addToWatchList(selection) : this.removeFromWatchList(selection);

    this.getWatchList();
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
