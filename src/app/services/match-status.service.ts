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
  private groupSubject = new Subject<any>();
  allSelections: any[];
  private notificationSubscription = new Subject<any>();

  constructor(private userPreferenceService: UserPropertiesService) { }

  //IGNORE STATUS
  // TODO: NEED TO MAKE OBSERVABLES
  //TODO: If Observable is not necessary...do we just filter?
  removeFromWatchList(selectionToRemove: any) {
    var selectionPosition: number;

    selectionPosition = this.watchList.indexOf(selectionToRemove);
    console.log(" Found " + selectionToRemove.Home + " vs " + selectionToRemove.Away + " in watchList: " + this.watchList.includes(selectionToRemove) + ". removing now..." );

    this.watchList.forEach( (selectionInList, index) => {

      if(selectionInList == selectionToRemove.Home || selectionInList == selectionToRemove.Away){
        selectionPosition = index;
      }
    });
    this.watchList.splice(selectionPosition, 1);
  }

  addToWatchList(match: any) {
    console.log("Added to WatchList: " + match.Home + " v. " + match.Away);
    //selection already in watchlist? do nothing, else push.
    this.watchList.includes(match) ? null : this.watchList.push(match);
    this.updateNotificationStatus(match);
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
    return userTableSettings ? userTableSettings : [];
    // upon startup, return localStorage item 'userWatchList'
    // pass this back to match-table and have it act like the watchAll setting, except based off of each watchList component.
  }

  //will updateNotification Status: Used to trigger toast notification.
  private updateNotificationStatus(selection: any) {
    var filterSelection: number = this.userPreferenceService.getOptionSelected();
    var minOdds: number = +this.userPreferenceService.getMinOdds();
    var maxOdds: number = +this.userPreferenceService.getMaxOdds();
    //View status of seletion
    // console.log(selection);

    var tableFilterValue;

    switch(filterSelection){
      case 1:
        tableFilterValue = this.userPreferenceService.getEV();
        //May need to get individually calculated match stats and compare.. This block of code should handle in a separate method.
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
      } else {
        return false;
      }
    });
    console.log("UPDATEWATCHLIST METHOD");
    console.log(this.watchList);
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
    console.log("No. of events to update: " + matchToUpdate.length);
    (matchToUpdate.length > 0) ? (isHome ? matchToUpdate[0].HStatus.notify = selection.notify : matchToUpdate[0].AStatus.notify = selection.notify) : null;
    console.log(matchToUpdate[0])
  }

  displayIgnoreList(){
    console.log("MATCHES IN IGNORE LIST: ");
    this.watchList.forEach(selection =>{
      console.log(selection);
    })
  }

  getWatchList(): any[]{
    // console.log(this.watchList);
    return this.watchList;
  }

    //compares WatchList with juicySelection states.
    //MAKE SURE WATCHLIST IS ACTUALLY BEING UPDATED>
  isWatched( selectionName:string):boolean {
      console.log("ISWATCHED METHOD 1.watchlist --> 2.selectionName");
      console.log(this.watchList);
      console.log(selectionName);


    const state:any = this.watchList.filter( fixture => {
      if(fixture.Home == selectionName && fixture.HStatus.notify) {
        console.log("RETURNED TRUE isWATCHED");

        return true
      }
      else if(fixture.Away == selectionName && fixture.AStatus.notify) {
        console.log("RETURNED TRUE from isWATCHED");

        return true;
      } else {
        console.log("----Watchlist FIXTURE");
        console.log(fixture);
        console.log("----JUICY SELECTION");
        console.log(selectionName);

        console.log("not in watchlist OR notification set to false.");
        return false;
      }
    });

    let result =  state.length > 0 ? true : false

    return result
  }

  notifyUser(juicy: {selection:string, notifyState:boolean, epoch:number} ){
    console.log('NotifyIn MatchStatus. Subject');
    console.log(juicy);
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
