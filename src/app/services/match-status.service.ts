import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserPropertiesService } from './user-properties.service';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {
  watchList: any[]=[];
  private watchSubject = new Subject<any>();
  private groupSubject = new Subject<any>();
  allSelections: any[];

  constructor(private userPreferenceService: UserPropertiesService) { }

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

  updateWatchList(matchObj: any, isHome:boolean): void{
    const matchToUpdate = this.watchList.filter(watchListObj => {
      console.log(watchListObj);

      if(isHome && matchObj.Home == watchListObj.Home && matchObj.EpochTime == watchListObj.EpochTime){
        watchListObj.HStatus.notify = matchObj.HStatus.notify;
      }
      else if (!isHome && matchObj.Away == watchListObj.Away && matchObj.EpochTime == watchListObj.EpochTime){
        watchListObj.AStatus.notify = matchObj.AStatus.notify;
      }
    });
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
    });
    return matchIsWatched.length != 0 ? true : false;
  }

  //WATCHLIST STATUS

  //called at matchTable on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    //create observable
    this.watchSubject.next(selection);
    //add to list for notification services
    selection.isWatched ? this.addToWatchList(selection) : this.removeFromWatchList(selection);
    //get user preferences for odds and set notification here.
    this.setNotificationStatus(selection);
    this.getWatchList();
  }
  private setNotificationStatus(selection: any) {
    selection.BHome > this.userPreferenceService.getMinOdds() ? selection.HStatus.notify = true : selection.HStatus.notify = false;
    selection.BAway > this.userPreferenceService.getMinOdds() ? selection.AStatus.notify = true : selection.AStatus.notify = false;
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
