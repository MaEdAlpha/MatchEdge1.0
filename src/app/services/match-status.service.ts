import { Injectable, EventEmitter } from '@angular/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserPropertiesService } from './user-properties.service';

@Injectable({
  providedIn: 'root'
})

export class MatchStatusService {

  watchList: any[]=[];
  private watchSubject = new Subject<any>();
  private removeMatchSubject = new Subject<any>();
  private groupSubject = new Subject<any>();
  private loadUserLocalStoredDataSubject = new Subject<boolean>();
  allSelections: any[];
  private notificationSubscription = new Subject<any>();

  constructor(private userPreferenceService: UserPropertiesService) { }

  //IGNORE STATUS
  // TODO: NEED TO MAKE OBSERVABLES
  //TODO: If Observable is not necessary...do we just filter?
  removeFromWatchList(selectionToRemove: any) {
    var selectionPosition: number;

    selectionPosition = this.watchList.indexOf(selectionToRemove);
    //console.log(" Found " + selectionToRemove.Home + " vs " + selectionToRemove.Away + " in watchList: " + this.watchList.includes(selectionToRemove) + ". removing now..." );

    this.watchList.forEach( (selectionInList, index) => {

      if(selectionInList == selectionToRemove.Home || selectionInList == selectionToRemove.Away){
        console.log("TWO THE SAME? " + selectionPosition == index + "IF SO, DELETE THIS");
        selectionPosition = index;
      }
    });
    this.watchList.splice(selectionPosition, 1);
  }

  removeFromWatchListAfterRecordBet(row){
    let selectionPosition = this.watchList.indexOf(fixture => { fixture.Home == row.Selection || fixture.Away == row.Selection && row.EpochTime == fixture.EpochTime})
    this.watchList.splice(selectionPosition, 1);

    this.removeMatchSubject.next(row);
  }

  addToWatchList(match: any) {
    //console.log("Added to WatchList: " + match.Home + " v. " + match.Away);
    //selection already in watchlist? do nothing, else push.
    this.watchList.includes(match) ? null : this.watchList.push(match);
    this.updateNotificationStatus(match);
  }

  individualMatchesFinishedLoading(triggerInFixturesTable:boolean){
    this.loadUserLocalStoredDataSubject.next(triggerInFixturesTable);
  }
  initiatePreviousTableSettings():Observable<boolean>{
    return this.loadUserLocalStoredDataSubject.asObservable();
  }



   //called at matchTable on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    //create observable
      this.watchSubject.next(selection);
      this.updateNotificationStatus(selection);
    //add to list for notification services
    //get user preferences for odds and set notification here.
  }

  //only updates when watchlist button is triggered, not notifications.
  updateLocalStorage(userWatchList:any){
    let item = JSON.stringify(userWatchList);
    localStorage.setItem('userWatchList', item);
  }

  initializeLocalStorage(): any {
    let userTableSettings = localStorage.getItem('userWatchList');
    userTableSettings = JSON.parse(userTableSettings);
    //console.log("USERWATCHLIST");

    //console.log(userTableSettings);

    return userTableSettings ? userTableSettings : [];
    // upon startup, return localStorage item 'userWatchList'
    // pass this back to match-table and have it act like the watchAll setting, except based off of each watchList component.
  }

  //will updateNotification Status: Used to trigger toast notification.
  private updateNotificationStatus(selection: any) {
    var filterSelection: number = this.userPreferenceService.getSelectedFilterValue();
    var minOdds: number = +this.userPreferenceService.getMinOdds();
    var maxOdds: number = +this.userPreferenceService.getMaxOdds();
    //View status of seletion
    // console.log(selection);

    var tableFilterValue;

    switch(filterSelection){
      case 1:
          tableFilterValue = this.userPreferenceService.getEV();
        break;
        case 2:
          tableFilterValue = this.userPreferenceService.getMR();
        break;
        case 3:
          tableFilterValue = this.userPreferenceService.getSS();
        break;
      default:
        console.log("Error retrieving user filter settings");
      }
        //alter notification state based off of min/max user odds
        selection.HStatus.notify = +selection.BHome <= maxOdds && +selection.BHome >= minOdds && selection.EpochTime*1000 > Date.now() ?  true :  false;
        selection.AStatus.notify = +selection.BAway <= maxOdds && +selection.BAway >= minOdds && selection.EpochTime*1000 > Date.now() ? true : false;
  }

  updateWatchList(matchObj: any, isHome:boolean): void{
      this.watchList.filter(watchListObj => {
      // console.log("Updating Watchlist:");

      if(isHome && matchObj.Home == watchListObj.Home && matchObj.EpochTime == watchListObj.EpochTime){
        watchListObj.HStatus.notify = matchObj.HStatus.notify;
        return true;
      }
      else if (!isHome && matchObj.Away == watchListObj.Away && matchObj.EpochTime == watchListObj.EpochTime){
        watchListObj.AStatus.notify = matchObj.AStatus.notify;
        return true;
      }
      else if(watchListObj.isPastPrime) {
        return false;
      }
      else {
        return false;
      }
    });
    //console.log("-------UPDATEWATCHLIST METHOD-------");
    //console.log(this.watchList);
    //console.log("-----------------------------------");

    this.updateLocalStorage(this.watchList);
  }

  //I THINK THIS IS TO NOTIFY WATCHLIST/FIXTURES WHEN TO CHANGE NOTIFY STATE.
  updateWatchListFromStream(selection){
    var isHome:boolean;
    const matchToUpdate = this.watchList.filter( fixture => {
      if( (fixture.Home == selection.Selection || fixture.Away == selection.Selection) && fixture.EpochTime == selection.EpochTime ) {
        isHome = (fixture.Home == selection.Selection) ? true : false;
        return true;
      } else {
        return false;
      }
    });
   // console.log("No. of events to update: " + matchToUpdate.length);
    (matchToUpdate.length > 0) ? (isHome ? matchToUpdate[0].HStatus.notify = selection.notify : matchToUpdate[0].AStatus.notify = selection.notify) : null;
   // console.log(matchToUpdate[0])
  }

  getWatchList(): any[]{
    // console.log(this.watchList);
    return this.watchList;
  }

    //compares WatchList with juicySelection states.
    //MAKE SURE WATCHLIST IS ACTUALLY BEING UPDATED>
  isWatched( selectionName:string):boolean {
     console.log("----------isWatchedMethod---------");
     console.log(this.watchList);
     console.log(selectionName);


    const state:any = this.watchList.filter( fixture => {
      if(fixture.Home == selectionName && fixture.HStatus.notify || (fixture.Away == selectionName && fixture.AStatus.notify)) {
       // console.log("--------isWatched Result: ------------");
       // console.log("Found " + fixture.Home + "= Home Team, isWatched = true");
       console.log(selectionName + " match FOUND in watchList, return TRUE");
        return true
      } else {
       // console.log("--------isWatched Result: ------------");
       // console.log(" Nothing Found! for above SelectionName! ");
         console.log(selectionName + " match NOT found in watchList, return FALSE");

        return false;
      }
    });


    let result =  state.length > 0 ? true : false
    //console.log("----------------Showing Filter Results: " + selectionName + "----------------");
   // console.log(state);
    //console.log("Result: " + result);

    //console.log("------------------------------------------------");

    return result
  }

  notifyUser(juicy: {selection:string, notifyState:boolean, epoch:number} ){
   // console.log('Notify User: ' + juicy.selection + " notifyState: " + juicy.notifyState);
    this.notificationSubscription.next(juicy);
  }

  getNotifyUserListener():Observable<any>{
    return this.notificationSubscription.asObservable();
  }

  unwatchMatchSubject(rowData: any) {
    throw new Error('Method not implemented.');
  }
  getMatchWatchStatus(): Observable<any>{
    return this.watchSubject.asObservable();
  }

  removeFromWatchListEvent(): Observable<any>{
    return this.removeMatchSubject.asObservable();
  }

  watchGroupSubject( masterGroup: any) {
    this.groupSubject.next(masterGroup);
  }

  checkIfWatchlistEmpty():boolean{
    var isEmpty = this.watchList.length == 0 ? true : false;

    return isEmpty;
  };


  getMasterGroup(): Observable<any>{
    return this.groupSubject.asObservable();
  }

}
