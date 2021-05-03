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

  addToWatchList(selection: any) {
    console.log(" Found " + selection.Home + " vs " + selection.Away + " in watchList: " + this.watchList.includes(selection) + ". adding now..." );
    //selection already in watchlist? do nothing, else push.
    this.watchList.includes(selection) ? null : this.watchList.push(selection);
    this.updateNotificationStatus(selection);
  }

  updateWatchList(matchObj: any, isHome:boolean): void{
    const matchToUpdate = this.watchList.filter(watchListObj => {
      console.log("Updating Watchlist:");

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
    console.log(matchToUpdate);
  }

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
    console.log("Length " + matchToUpdate.length);
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
    console.log(this.watchList);
    return this.watchList;
  }

  isWatched( selection:string):boolean {

    var state:any = this.watchList.filter( fixture => {
      if(fixture.Home == selection && fixture.HStatus.notify) {
        return true
      }
      else if(fixture.Away == selection && fixture.AStatus.notify) {
        return true;
      } else {
        console.log(fixture);
        console.log("not in watchlist OR notification set to false.");
        return false;
      }
    });

    console.log(Object.keys(state).length > 0);

    return Object.keys(state).length > 0;
  }

  //WATCHLIST STATUS

  //called at matchTable on Initialization. Used to listen for any changes
  watchMatchSubject( selection: any){
    //create observable
    this.watchSubject.next(selection);
    //add to list for notification services
    //get user preferences for odds and set notification here.
    this.updateNotificationStatus(selection);
    this.getWatchList();
  }

  //will updateNotification Status: Used to trigger toast notification.
  private updateNotificationStatus(selection: any) {
    var filterSelection: number = this.userPreferenceService.getOptionSelected();
    var tableFilterValue: number;
    var selectionValue:number;

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
        console.log("Something went wrong in retrieving table filter data");
    }
    ( selection.BHome > this.userPreferenceService.getMinOdds() && selection.EpochTime*1000 > Date.now() ) ? selection.HStatus.notify = true : selection.HStatus.notify = false;
    ( selection.BAway > this.userPreferenceService.getMinOdds() && selection.EpochTime*1000 > Date.now() ) ? selection.AStatus.notify = true : selection.AStatus.notify = false;
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

  getMasterGroup(): Observable<any>{
    return this.groupSubject.asObservable();
  }

}
