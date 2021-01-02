import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CalcSettings } from './calc-settings/calc-settings.model';
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { TriggerOdds } from './match-notification-settings/trigger-odds.model';
import { UserProperties, TablePreferences } from './user-properties.model';

@Injectable({
  providedIn: 'root'
})
export class UserPropertiesService {
  //
  triggerOddsSelected = new EventEmitter<TriggerOdds[]>();

  //for sending to JuicyTable Filter method
  viewTablePrefSelected = new EventEmitter<any>();
  userPrefSub = new Subject<TablePreferences>();

  private smCommission:number = 2.05;
  //TODO re-write to notifPref defaultTriggers in UserProperties Model
  private defaultOdds: TriggerOdds[] = [
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99}
  ];
//NOTE, stake:100 with oddsLow:0 should be changed later. Development purposes
//TODO re-write to calcPref in UserPropertiesModel
  private userStakes: CalcSettings[] = [{stake: 100, oddsLow: 0, oddsHigh:2.0}, {stake: 80, oddsLow: 2, oddsHigh: 3},{stake: 60, oddsLow: 3, oddsHigh: 4}, {stake: 50, oddsLow: 4, oddsHigh: 5}, {stake: 40, oddsLow: 5, oddsHigh: 6}, {stake: 20, oddsLow: 6, oddsHigh: 7}, {stake: 10, oddsLow: 7, oddsHigh: 10000}];
  private defaultStakes: CalcSettings[] = [{stake: 999, oddsLow: 1.5, oddsHigh:2.0}, {stake: 80, oddsLow: 2, oddsHigh: 3},{stake: 60, oddsLow: 3, oddsHigh: 4}, {stake: 50, oddsLow: 4, oddsHigh: 5}, {stake: 40, oddsLow: 5, oddsHigh: 6}, {stake: 20, oddsLow: 6, oddsHigh: 7}, {stake: 10, oddsLow: 7, oddsHigh: 10000}];
  private oddsRange: string[] =  ["1.5 - 2.0", "2.0 - 3.0", "3.0 - 4.0 ", "4.0 - 5.0", "5.0 - 6.0", "6.0 - 7.0", "    > 7.0 "];

  private dbOdds: TriggerOdds[] = [
    {start: 1.50, finish: 1.75 },
    {start: 1.76, finish: 1.99 },
    {start: 2, finish: 2.04 },
    {start: 2.46, finish: 2.52 },
    {start: 2.82, finish: 2.9 },
    {start: 3.2, finish: 3.3 },
    {start: 4.5, finish: 4.7 },
    {start: 5.4, finish: 5.7 },
    {start: 6.2, finish: 6.6 },
    {start: 7.6, finish: 8.2 },
    {start: 8.8, finish: 9.6 },
    {start: 10, finish: 11 },
    {start: 14, finish: 16}
  ];


  //ViewTable User Preferences
  private viewTablePrefs: TablePreferences = {
    leagueSelection: ['Retrieved from UserPropertiesService'],
    timeRange: 'Today & Tomorrow',
    minOdds: '2.1',
    maxOdds: '4.5',
    evFilterValue: '0',
    maxRatingFilter: '98.50',
    isEvSelected: 'true'
  };

  constructor() { }

  getUserProperties() {
    //http GET request to retrieve user properties from DB;
  }

  getCommission(){
    //link this to DB
    return this.smCommission;
  }
  setCommission(userInput: number){
    this.smCommission = userInput;
  }

  getTriggerOdds(){
    if(!this.dbOdds)
    {
      return this.defaultOdds;
    } else {
      return this.dbOdds;
    }
  }

  accessUserStakes() {
    return this.userStakes;
  }

  accessDefaultStakes() {
    return this.defaultStakes;
  }

  accessOddsRange() {
    return this.oddsRange;
  }

  saveCalcSettings(calcPref) {
    this.userStakes = calcPref;
    console.log(this.userStakes);
  }

  getUserStakePreferences():CalcSettings[]
  {
    return this.userStakes;
  }

  //View Table Settings

  getFormValues(){
    //Insert link btw GET request and property here.
    return this.viewTablePrefs;
  }

  setFormValues(formObj: any){
    this.viewTablePrefSelected.emit(this.viewTablePrefs);
    //min-max|EVfilter|dateRange|leagues
    console.log("EV filter selected? " + formObj.isEvSelected);

    this.userPrefSub.next({
      leagueSelection: formObj.leagueSelection,
      timeRange: formObj.timeRange,
      minOdds: formObj.minOdds,
      maxOdds: formObj.maxOdds,
      evFilterValue: formObj.evFilterValue,
      maxRatingFilter: formObj.maxRatingFilter,
      isEvSelected: formObj.isEvSelected
    });
  }
  //userPreference TablePreferences
  getUserPrefs(): Observable<TablePreferences>{
    return this.userPrefSub.asObservable();
  }

  getEV():number{
    return Number(this.viewTablePrefs.evFilterValue);
  }

  getMR(): number{
    //TODO add MatchRating in sidenav
    return Number(this.viewTablePrefs.maxRatingFilter);
  }

  getMinOdds(): number{
    return Number(this.viewTablePrefs.minOdds);
  }

  getMaxOdds(): number {
    return Number(this.viewTablePrefs.maxOdds);
  }

  getTablePrefs(): TablePreferences {
    return this.viewTablePrefs;
  }

  getSelectedDate(): string {
    return this.viewTablePrefs.timeRange;
  }
}
