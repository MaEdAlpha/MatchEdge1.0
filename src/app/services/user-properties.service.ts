import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CalcSettings } from '../calc-settings/calc-settings.model';
import { CalcSettingsService } from '../calc-settings/calc-settings.service';
import { TriggerOdds } from '../match-notification-settings/trigger-odds.model';
import { NotificationBoxService } from './notification-box.service';
import { TablePreferences, UserSettings } from '../user-properties.model';

@Injectable({
  providedIn: 'root'
})
export class UserPropertiesService {
  //Don't need this
  triggerOddsSelected = new EventEmitter<TriggerOdds[]>();
  //for sending to JuicyTable Filter method
  viewTablePrefSelected = new EventEmitter<any>();
  userPrefSub = new Subject<TablePreferences>();
  private lockAudio:boolean = true;
  private smCommission:number = 2.05;

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
  //NOTE, stake:100 with oddsLow:0 should be changed later. Development purposes
  //TODO re-write to calcPref in UserPropertiesModel
  private userStakes: CalcSettings[] = [
                                        {stake: 100, oddsLow: null, oddsHigh:2.01},
                                        {stake: 80, oddsLow: 2.01, oddsHigh: 3},
                                        {stake: 60, oddsLow: 3.01, oddsHigh: 4},
                                        {stake: 50, oddsLow: 4.01, oddsHigh: 5},
                                        {stake: 40, oddsLow: 5.01, oddsHigh: 6},
                                        {stake: 20, oddsLow: 6.01, oddsHigh: 8},
                                        {stake: 10, oddsLow: 8.01, oddsHigh: 10},
                                        {stake: 10, oddsLow: 10.01, oddsHigh: 12},
                                        {stake: 5, oddsLow: 7, oddsHigh: 14},
                                        {stake: 1, oddsLow: 14.01, oddsHigh: 100000000},
                                                                                ];

  private defaultStakes: CalcSettings[] = [
                                            {stake: 100, oddsLow: 0, oddsHigh:2.01},
                                            {stake: 80, oddsLow: 2.01, oddsHigh: 3},
                                            {stake: 60, oddsLow: 3.01, oddsHigh: 4},
                                            {stake: 50, oddsLow: 4.01, oddsHigh: 5},
                                            {stake: 40, oddsLow: 5.01, oddsHigh: 6},
                                            {stake: 20, oddsLow: 6.01, oddsHigh: 8},
                                            {stake: 10, oddsLow: 8.01, oddsHigh: 10},
                                            {stake: 10, oddsLow: 10.01, oddsHigh: 12},
                                            {stake: 12.01, oddsLow: 7, oddsHigh: 14},
                                            {stake: 10, oddsLow: 14.01, oddsHigh: 100000000},
                                                                                        ];
  private oddsRange: string[] =  ["< 2.00 ", "2.01 - 3.00", "3.01 - 4.00 ", "4.01 - 5.00", "5.01 - 6.00 ", "6.01 - 8.00", "8.01 - 10.00","10.01 - 12.00", "12.01 - 14.00", "   > 14.0 "];

  //ViewTable User Preferences
  private viewTablePrefs: TablePreferences = {
    leagueSelection: ['Get Rid of this Field'],
    timeRange: 'Today & Tomorrow',
    minOdds: '2.5',
    maxOdds: '20',
    evFilterValueI: '-20',
    evFilterValueII: '1',
    matchRatingFilterI: '95',
    matchRatingFilterII: '97',
    secretSauceI: '-1.5',
    secretSauceII: '-1.2',
    isEvSelected: '1',
    dialogDisabled: true,
    audioEnabled: true,
  };

  private settings: UserSettings = {
      account: { username: "chaarlie",
                 firstName: "ryan",
                 lastName: "anderson",
                 email: "juicyBets@fmail.com",
                 quote: "giddyup",
                 password:"salty"
               },

      preferences: { userPrefferedStakes: this.userStakes,
                     ftaOption: 'generic',
                     exchangeOption: {name: 'Smarkets', commission: 2}
                   },

      filters:     { viewTable: this.viewTablePrefs}
  }

  constructor() { }

  getUserSettings(): UserSettings {
    //http GET request to retrieve user properties from DB;
    // assign to settings: UserSettings.

    return  this.settings;
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

    console.log(formObj);

    this.userPrefSub.next({
      leagueSelection: formObj.leagueSelection,
      timeRange: formObj.timeRange,
      minOdds: formObj.minOdds,
      maxOdds: formObj.maxOdds,
      evFilterValueI: formObj.evFilterValueI,
      evFilterValueII: formObj.evFilterValueII,
      matchRatingFilterI: formObj.matchRatingFilterI,
      matchRatingFilterII: formObj.matchRatingFilterII,
      secretSauceI: formObj.secretSauceI,
      secretSauceII: formObj.secretSauceII,
      isEvSelected: formObj.isEvSelected,
      dialogDisabled: formObj.dialogDisabled,
      audioEnabled: formObj.audioEnabled,
    });

    this.viewTablePrefs = {
      leagueSelection: formObj.leagueSelection,
      timeRange: formObj.timeRange,
      minOdds: formObj.minOdds,
      maxOdds: formObj.maxOdds,
      evFilterValueI: formObj.evFilterValueI,
      evFilterValueII: formObj.evFilterValueII,
      matchRatingFilterI: formObj.matchRatingFilterI,
      matchRatingFilterII: formObj.matchRatingFilterII,
      secretSauceI: formObj.secretSauceI,
      secretSauceII: formObj.secretSauceII,
      isEvSelected: formObj.isEvSelected,
      dialogDisabled: formObj.dialogDisabled,
      audioEnabled: formObj.audioEnabled,
    }
    this.viewTablePrefSelected.emit(this.viewTablePrefs);
  }
  //userPreference TablePreferences
  getUserPrefs(): Observable<TablePreferences>{
    return this.userPrefSub.asObservable();
  }


  getEV():number{
    return Number(this.viewTablePrefs.evFilterValueI);
  }

  getEVNotification():number{
    return Number(this.viewTablePrefs.evFilterValueII);
  }

  getMR(): number{
    //TODO add MatchRating in sidenav
    return Number(this.viewTablePrefs.matchRatingFilterI);
  }

  getSS(): number {
    return Number(this.viewTablePrefs.secretSauceI);
  }

  getMinOdds(): number{
    return Number(this.viewTablePrefs.minOdds);
  }

  getMaxOdds(): number {
    return Number(this.viewTablePrefs.maxOdds);
  }

  getOptionSelected(): number {
    return Number(this.viewTablePrefs.isEvSelected);
  }

  getTablePrefs(): TablePreferences {
    return this.viewTablePrefs;
  }

  getSelectedDate(): string {
    return this.viewTablePrefs.timeRange;
  }

  getFilterSelection(): number {
    return +this.viewTablePrefs.isEvSelected;
  }

  getDialogDisabled(): boolean {
    return this.viewTablePrefs.dialogDisabled;
  }

  getAudioPreferences(): boolean {
    return this.viewTablePrefs.audioEnabled;
  }

  setNotificationLock(state:boolean){
    this.lockAudio = state;
  }

  getNotificationLock(): boolean {
    return this.lockAudio;
  }
}
