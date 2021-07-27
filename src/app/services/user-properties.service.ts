import { Injectable, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CalcSettings } from '../calc-settings/calc-settings.model';
import { CalcSettingsService } from '../calc-settings/calc-settings.service';
import { TriggerOdds } from '../match-notification-settings/trigger-odds.model';
import { NotificationBoxService } from './notification-box.service';
import { TablePreferences, UserSettings } from '../user-properties.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '../../environments/environment.prod';
import { map } from 'rxjs/operators';
import { logging } from 'selenium-webdriver';
import { Router } from '@angular/router';
import { response } from 'express';
import { promise } from 'protractor';
import { Subscriber } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserPropertiesService {
  //for sending to JuicyTable Filter method
  private PROMOTION_PLAN = 'P-55U356720M569264VMD32CZI';
  private BASIC_PLAN ='P-59888107MU817684HMD3ZXZY';
  userToken = new EventEmitter<string>();
  userPrefSub = new Subject<TablePreferences>();
  userCommissionSub = new Subject<number>();
  tokenSubscription = new Subject<string>();
  userSubscriptionSubject = new Subject<{isActiveSub:boolean, isNewUser:boolean, status: string}>();
  isNewUser: boolean = true;
  private lockAudio:boolean = true;
  private smCommission:number = 2.05;
  private token: string;

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
                                        {stake: 0, oddsLow: null, oddsHigh:2.00},
                                        {stake: 1, oddsLow: 2.01, oddsHigh: 3},
                                        {stake: 2, oddsLow: 3.01, oddsHigh: 4},
                                        {stake: 3, oddsLow: 4.01, oddsHigh: 5},
                                        {stake: 4, oddsLow: 5.01, oddsHigh: 6},
                                        {stake: 5, oddsLow: 6.01, oddsHigh: 8},
                                        {stake: 6, oddsLow: 8.01, oddsHigh: 10},
                                        {stake: 7, oddsLow: 10.01, oddsHigh: 12},
                                        {stake: 8, oddsLow: 7, oddsHigh: 14},
                                        {stake: 9, oddsLow: 14.01, oddsHigh: 100000000},
                                                                                ];
  private oddsRange: string[] =  ["< 2.00 ",
                                  "2.01 - 3.00",
                                  "3.01 - 4.00",
                                  "4.01 - 5.00",
                                  "5.01 - 6.00 ",
                                  "6.01 - 8.00",
                                  "8.01 - 10.00",
                                  "10.01 - 12.00",
                                  "12.01 - 14.00",
                                  "   > 14.0 "];

  private oddsRangeUpperLimit: number[]= [2,3,4,5,6,8,10,12,14,14]
  //ViewTable User Preferences
  private viewTablePrefs: TablePreferences = {
    timeRange: 'Today & Tomorrow',
    minOdds: '2.5',
    maxOdds: '20',
    evFVI: '-2000',
    evFVII: '-1000',
    matchRatingFilterI: '95',
    matchRatingFilterII: '97',
    secretSauceI: '-1.5',
    secretSauceII: '-1.2',
    fvSelected: '1',
    audioEnabled: true,
  };

  private settings: UserSettings = {
    juicyId: "blank",

    account: {
               username: "JuicyUser",
               firstName: "Juicy",
               lastName: "User",
               email: "juicy@bets.com",
               quote: "blank",
             },

    preferences: { userPrefferedStakes: [
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
                                        ],
                   ftaOption: 'blank',
                   exchangeOption: {name: 'blank', commission: 2}
                 },

    filters:     this.viewTablePrefs
  }

  constructor(private http: HttpClient, private router: Router) { }

  getUserSettings(): UserSettings {
    return  this.settings;
  }


  //return data from DB and set to userDetails. Once AuthO sign in finished. Get user settings. Verify subscriptions.
  getSettings(email:string, sub:string){
    //http GET request to retrieve user properties from DB;
    var data: {email: string, sub: string} = {email: email, sub:sub};
    var userData;
    //initially would return a promise to allow the rest of the site to load.

    this.http.put<{token:string, userDetails: UserSettings}>(
      env.serverUrl + "/api/user/connect", data)
      .subscribe( (body) => {
        userData = body;
        // console.log('Requesting...');
        // console.log(body);

        this.token = userData.token;
        this.saveAuthData(this.token, userData.expiry)
        // this.tokenSubscription.next(userData.token);

        this.settings.juicyId = userData.userDetails._id;
        this.settings.account = userData.userDetails.account;
        this.settings.filters = {
          timeRange: userData.userDetails.filters.timeRange,
          minOdds: userData.userDetails.filters.minOdds,
          maxOdds: userData.userDetails.filters.maxOdds,
          evFVI: userData.userDetails.filters.evFVI,
          evFVII: userData.userDetails.filters.evFVII,
          matchRatingFilterI: userData.userDetails.filters.mrFVI,
          matchRatingFilterII: userData.userDetails.filters.mrFVII,
          secretSauceI: userData.userDetails.filters.ssFVI,
          secretSauceII: userData.userDetails.filters.ssFVII,
          fvSelected: userData.userDetails.filters.fvSelected,
          audioEnabled: userData.userDetails.filters.audioEnabled,
        }
        this.settings.preferences = userData.userDetails.preferences;
      });

      this.userCommissionSub.next(+this.settings.preferences.exchangeOption.commission);
      console.log("User Settings Loaded!");
      console.log(this.settings);

    }

    getTermsPage(){
      this.http.get<any>(env.serverUrl + 'api/policy').subscribe((body)=>{
        console.log(body.response);

      });
    }


    //get token and save to localStorage
  private saveAuthData(token: string, expirationDate: number) {
      localStorage.setItem('token',token);
      localStorage.setItem('expiration', expirationDate.toString());
  }

  public getAuthData(): {token:string, expirationDate:number}{
    let authData: {token:string, expirationDate:number};

   authData = {
      token: localStorage.getItem('token'),
      expirationDate: +localStorage.getItem('expiration')
  }
  console.log("LOCALSTORAGE!!!!!!!!!");

  console.log(authData);

    return authData
  }

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration');
  }

  resetPage(){
    setTimeout(() => {
      this.router.navigate(['/']);
    })
  }

  getCommission(){
    //link this to DB
    return this.settings.preferences.exchangeOption.commission;
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

  getToken(){
    return this.token;
  }

  getFTAOption(){
    return this.settings.preferences.ftaOption;
  }


  accessOddsRange(): string[] {
    return this.oddsRange;
  }

  accessOddsRangeUpperLimit(): number[] {
    return this.oddsRangeUpperLimit;
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

    this.settings.filters = {

      timeRange: this.settings.filters.timeRange,
      minOdds: formObj.filters.minOdds,
      maxOdds: formObj.filters.maxOdds,
      evFVI: formObj.filters.evFVI,
      evFVII: formObj.filters.evFVII,
      matchRatingFilterI: formObj.filters.matchRatingFilterI,
      matchRatingFilterII: formObj.filters.matchRatingFilterII,
      secretSauceI: formObj.filters.secretSauceI,
      secretSauceII: formObj.filters.secretSauceII,
      fvSelected: formObj.filters.fvSelected,
      audioEnabled: formObj.filters.audioEnabled,
    }

    this.userPrefSub.next({

      timeRange: this.settings.filters.timeRange,
      minOdds: formObj.filters.minOdds,
      maxOdds: formObj.filters.maxOdds,
      evFVI: formObj.filters.evFVI,
      evFVII: formObj.filters.evFVII,
      matchRatingFilterI: formObj.filters.matchRatingFilterI,
      matchRatingFilterII: formObj.filters.matchRatingFilterII,
      secretSauceI: formObj.filters.secretSauceI,
      secretSauceII: formObj.filters.secretSauceII,
      fvSelected: formObj.filters.fvSelected,
      audioEnabled: formObj.filters.audioEnabled,
    });
    console.log(this.settings.filters);

  }

  saveUserSettings(settingsForm, juicyId){
    console.log('DB Call to update settings (User Settings form + juId');

    this.settings = {                   account: {
                                                  username: settingsForm.account.UserName,
                                                  email: settingsForm.account.Email,
                                                  firstName: settingsForm.account.FirstName,
                                                  lastName: settingsForm.account.LastName,
                                                  quote: settingsForm.account.quote
                                                },
                                        preferences: {
                                                        userPrefferedStakes: [
                                                        settingsForm.preferences.PrefStake1,
                                                        settingsForm.preferences.PrefStake2,
                                                        settingsForm.preferences.PrefStake3,
                                                        settingsForm.preferences.PrefStake4,
                                                        settingsForm.preferences.PrefStake5,
                                                        settingsForm.preferences.PrefStake6,
                                                        settingsForm.preferences.PrefStake7,
                                                        settingsForm.preferences.PrefStake8,
                                                        settingsForm.preferences.PrefStake9,
                                                        settingsForm.preferences.PrefStake10 ],

                                                        ftaOption: settingsForm.preferences.SelectedFTA,
                                                        exchangeOption: { name: settingsForm.preferences.SelectedExchange,
                                                                          commission: settingsForm.preferences.SelectedCommission
                                                                        }
                                                      },
                                        filters:   {
                                                    timeRange: this.viewTablePrefs.timeRange,
                                                    minOdds: settingsForm.filters.minOdds,
                                                    maxOdds: settingsForm.filters.maxOdds,
                                                    evFVI: settingsForm.filters.evFVI,
                                                    evFVII: settingsForm.filters.evFVII,
                                                    matchRatingFilterI: settingsForm.filters.matchRatingFilterI,
                                                    matchRatingFilterII: settingsForm.filters.matchRatingFilterII,
                                                    secretSauceI: settingsForm.filters.secretSauceI,
                                                    secretSauceII: settingsForm.filters.secretSauceII,
                                                    fvSelected: settingsForm.filters.fvSelected,
                                                    audioEnabled: settingsForm.filters.audioEnabled,
                                                   },
                                      juicyId: juicyId,
                    }

                    console.log("----2. PUT to DB -----");
                    console.log(this.settings);
    this.http.put<any>(env.serverUrl +  "/api/user/settings",this.settings).subscribe( (response) => {
      console.log("Client Side Update saved response");
      console.log(response);
    }
    );

  }
  //userPreference TablePreferences

  getUserId(): string {
    return this.settings.juicyId;
  }
  getUserPrefs(): Observable<TablePreferences>{
    return this.userPrefSub.asObservable();
  }

  refreshTablePreference() {
    this.userPrefSub.next(this.settings.filters);
  }

  getCommissionObservable(): Observable<number>{
    return this.userCommissionSub.asObservable();
  }

  getSubscriptionState(): Observable<{isActiveSub:boolean, isNewUser:boolean, status: string}>{
    return this.userSubscriptionSubject.asObservable();
  }

  pageRefresh(){
    console.log("Do the things");
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    setTimeout(() => {
      this.router.navigate(['/matches']);
    },1000);
  }

  getUserName(): string{
    return this.settings.account.firstName;
  }

  getFTASelected(){
    //retrieve either brooks or generic FTA selection.
  }
  getEV():number{
    return Number(this.settings.filters.evFVI);
  }
  getEVNotification():number{
    return Number(this.settings.filters.evFVII);
  }
  getMR(): number{
    return Number(this.settings.filters.matchRatingFilterI);
  }

  getSS(): number {
    return Number(this.settings.filters.secretSauceI);
  }

  getMinOdds(): number{
    return Number(this.settings.filters.minOdds);
  }

  getMaxOdds(): number {
    return Number(this.settings.filters.maxOdds);
  }

  getSelectedFilterValue(): number {
    return Number(this.settings.filters.fvSelected);
  }

  getTablePrefs(): TablePreferences {
    return this.settings.filters;
  }

  getUserPrefferedStakes(backOdds:number):number {
    var prefStake: number;
    this.userStakes.forEach( preference => {
      if(backOdds <= preference.oddsHigh && backOdds >= preference.oddsLow){
        prefStake = +this.settings.preferences.userPrefferedStakes[preference.stake];
      }
    });
    return prefStake;
  }

  getSelectedDate(): string {
    return this.viewTablePrefs.timeRange;
  }

  getFilterSelection(): number {
    return +this.viewTablePrefs.fvSelected;
  }

  getAudioPreferences(): boolean {
    return this.settings.filters.audioEnabled;
  }

  setAudioNotificationLock(state:boolean){
    this.lockAudio = state;
  }

  getAudioNotificationLock(): boolean {
    return this.lockAudio;
  }

  getUserEmail(): string {
    return this.settings.account.email;
  }

  getSubState(email:string){
    let login = Date.now();

    let data = { 'email': email,
                  'login': login
               }

    this.http.post<any>(env.serverUrl + "/subscription", data)
    .subscribe(( response: {isActiveSub: boolean, isNewUser: boolean, status: string}) => {
      this.userSubscriptionSubject.next(response);
      this.isNewUser = response.isNewUser;
    });
  }

  updateUserPurchase(email, purchaseID, purchaseTime){
    let data = {
      email: email,
      subcription_id: purchaseID,
      subscription_created: purchaseTime
    }

    this.http.post<any>(env.serverUrl + "/finalize-subscription-session",data).subscribe( (response)=> {
      //do the thing for response.
      console.log(response);

    });
  }

  testPayPal(){

    let data = {
      message:'hi'
    }
    this.http.post<any>(env.serverUrl + '/api/paypal', data).subscribe( (response) => {
      console.log(response);

    });
  }

  getBillingInfo(userEmail:string): Promise<{subscription: string, status: string, lastPaid: string, nextPayment: string, paymentEmail: string}>{
    let data = {
      email:userEmail
    }
    return new Promise( resolve => {
      this.http.post<any>(env.serverUrl + '/billing-info', data).subscribe( (response) => {
        try{
          console.log(response);
          resolve({ subscription: response.subscription, status: response.status, lastPaid:response.lastPaid, nextPayment: response.nextPayment, paymentEmail: response.subscription_email});
        } catch (err){
          resolve(null);
        }
      });
    })
  }

  getPlans():{promo:string, basic:string}{
    return {promo: this.PROMOTION_PLAN, basic: this.BASIC_PLAN}
  }

  getUserAccountType():boolean{
    return this.isNewUser
  }

}
