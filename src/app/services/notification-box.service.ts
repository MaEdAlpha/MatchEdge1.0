import { Injectable } from '@angular/core';
import { GlobalConfig, ActiveToast, ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { DateHandlingService } from './date-handling.service';
import { MatchStatusService } from './match-status.service';
import { UserPropertiesService } from './user-properties.service';
import { SABToastSaveComponent } from '../sabtoast-save/sabtoast-save.component';
import { CustomToastComponent } from '../custom-toast/custom-toast.component';
import { SABToastDeleteComponent } from '../sabtoast-delete/sabtoast-delete.component';
import { SABToastUpdatedComponent } from '../sabtoast-updated/sabtoast-updated.component';
import { SABToastIncompleteComponent } from '../sabtoast-incomplete/sabtoast-incomplete.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationBoxService {
  public userSettings;
  public matchRatingFilterNotification: number = this.userPropService.getMR();
  public evNotificationFilter: number = this.userPropService.getEVNotification();
  public secretSauceNotification: number = this.userPropService.getSS();
  public fvSelected: number = this.userPropService.getFilterSelection();
  public tableDate: string = this.userPropService.getSelectedDate();
  private clickSubject = new Subject<{notificationIsActivated: boolean, matchObject: any }>();
  private audioEnabled: boolean = this.userPropService.getAudioPreferences();

  juicyFilterChange: Subscription;
  matchStatus:Subscription;

  toastOptions: GlobalConfig;

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService, private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService) {

      this.toastOptions = this.toast.toastrConfig;
      this.userSettings = this.userPropService.getTablePrefs();
      console.log("----------NOTIFICATION SETTINGS: Initialized Notif-box services-----------");
      console.log(this.userSettings);
      console.log("-------------------------------------------------------------------");
      this.matchRatingFilterNotification = +this.userSettings.matchRatingFilterII;
      this.evNotificationFilter = +this.userSettings.evFVII;
      this.secretSauceNotification = +this.userSettings.secretSauceII;
      this.fvSelected = +this.userSettings.fvSelected;
      this.tableDate = this.userSettings.timeRange;
      this.audioEnabled = this.userSettings.audioEnabled;

      this.juicyFilterChange = this.userPropService.getUserPrefs().subscribe(filterSettings => {
        console.log("----------NOTIFICATION SETTINGS: Observable refreshed in services-----------");
        console.log(filterSettings);
        console.log("-------------------------------------------------------------------");

      this.matchRatingFilterNotification = +filterSettings.matchRatingFilterII;
      this.evNotificationFilter = +filterSettings.evFVII;
      this.secretSauceNotification = +filterSettings.secretSauceII;
      this.fvSelected = +filterSettings.fvSelected;
      this.tableDate = filterSettings.timeRange;
      this.audioEnabled = filterSettings.audioEnabled;
    });

   }

  showNotification(){
    this.toast.success('Toastr Working', 'title');
  }

  showLove(){
    this.toast.info('😃 👊👊👊','',{
      timeOut:3000
    });
  }

  showToast(message, title): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast = this.toast.show(message, title,{
      toastComponent:CustomToastComponent,
      onActivateTick: true,
      timeOut: 5000,
      tapToDismiss: true,
      disableTimeOut:false,
      progressBar: true,
      extendedTimeOut: 2000,
      enableHtml:true,
      toastClass: "toast border-gold",
      positionClass:'inline',
      messageClass: 'backOdds',
    });

    return toast;
  }

  showTestSAB(){
   let message = "3.88" + "<br>" + "3.99";
   let title = "Aresenal";
   this.showToast(message, title);
  }

  //might have to disable the toastContainer somehow.

  saveToastSAB(row:any):ActiveToast<any>{
    var toast: ActiveToast<any>;

    toast= this.toast.show( row.Fixture + ' removed from watchlist.', row.Selection + ' saved to Active Bets!',{
      toastComponent: SABToastSaveComponent,
      onActivateTick: true,
      timeOut: 1800,
      disableTimeOut: false,
      tapToDismiss: true,
      toastClass: "toast border-gold",
      closeButton: true,
      messageClass: 'toast-message',
    });

    //may cause issues.

   return toast
  }

  showFreeMessage():ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast= this.toast.show( 'Thanks for checking us out, stay a while, let us know what you think!', 'Free trial', {
      timeOut:4000,
      tapToDismiss: true,
      positionClass:'toast-top-right',
    });
    return toast;
  }

  DeleteToastSAB(): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast= this.toast.show( ' ', 'Successfully Deleted!', {
      toastComponent: SABToastDeleteComponent,
      timeOut:1200,
      disableTimeOut: false,
      tapToDismiss: true,
      toastClass: "toast border-gold",
      messageClass: 'toast-message',
      positionClass:'toast-top-left',
    });
    return toast;
  }

  UpdateToastSAB(): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast= this.toast.show( '', 'Update Complete!', {
      toastComponent: SABToastUpdatedComponent,
      timeOut:1500,
      disableTimeOut:false,
      tapToDismiss:true,
      toastClass: "toast border-gold",
      messageClass: 'toast-message',
      positionClass:'toast-bottom-right',
    });
    return toast;
  }

  ClearJuicyToast(): ActiveToast<any>{
    var toast: ActiveToast<string>;
    toast = this.toast.show('', 'Juicy Reset!' , {
      toastComponent: SABToastUpdatedComponent,
      timeOut:500,
      disableTimeOut:false,
      tapToDismiss:true,
      toastClass: "toast border-gold",
      messageClass: 'toast-message',
      positionClass:'toast-bottom-right',
    });
    return toast;
  }

  cannotUseSite():ActiveToast<any>{
    var toast: ActiveToast<string>;
    toast = this.toast.info('In order to use this site, you must agree to the Terms of Use.','Terms of Use declined', {
      disableTimeOut: true,
      tapToDismiss:true
    });
    return toast;
  }

  SettledToastSAB(message:string): ActiveToast<any>{
    var toast: ActiveToast<any>;

    toast= this.toast.show(message, 'Bet Settled!', {
      toastComponent: SABToastIncompleteComponent,
      timeOut:2000,
      toastClass: "toast border-gold",
      messageClass: 'toast-message'
    });
    return toast;
  }

  enableToggleToast(){
    this.toast.error('Re-Enable toggle to view League Matches.')
  }

  //TODO import Datehandling ranges
  showJuicyNotification(mainMatch: any){
     var epochNotifications = this.dateHandlingService.returnGenericNotificationBoundaries();
     this.audioEnabled = this.userPropService.getAudioPreferences();
    console.log("Stream Detected: " + mainMatch.Selection + " | isJuicy = " + mainMatch.isJuicy);

    //THIS IS THE BREAD AND BUTTER FOR TOAST. FIX isWatched~~~ SHOULD GET AN ACTUAL STATE OF JUICY. Match STATUS SHOULD BE GETTING THE ACTUAL STATE. SHOULD BE UPDATING MATCH STATUS SERVICES.
    if(this.matchStatusService.isWatched(mainMatch.Selection) && this.isInEpochLimits(epochNotifications, mainMatch) ) {
      // console.log("----------------------------------------------------------------------------------------------------");
      // console.log("---------Now inside set isJuicy = true conditional " + this.fvSelected + " -------------");
      // console.log(mainMatch.Selection + " states |  Notify: " + mainMatch.notify + " userAware = " + mainMatch.userAware + " EvThisBet >= evNotificationFilter ? " + (mainMatch.EVthisBet >= this.evNotificationFilter) + " EVthisBet: " + mainMatch.EVthisBet + " >= ? " + this.evNotificationFilter + " this.evNotificationFilter" );
      // console.log("----------------------------------------------------------------------------------------------------");
      // console.log("----------------------------------------------------------------------------------------------------");

      mainMatch = this.toastNotificationTriggers(mainMatch);
    } else {
      console.log("\n\n--------- " + mainMatch.Selection + " did not qualify");
      console.log(mainMatch);
    }
    return mainMatch;
  }

  private toastNotificationTriggers(mainMatch: any) {
    if (mainMatch.notify && !mainMatch.userAware) {
      switch (this.fvSelected) {
        case 1:
          if (mainMatch.EVthisBet >= this.evNotificationFilter) {

            mainMatch = this.toastIt(mainMatch);
            //play audio if settings enables it
            (this.audioEnabled) ? this.playAudio() : null;
            mainMatch.isJuicy = true;
            //User is no aware of match being juicy. Therefore, they will not be notified of repeat updates until they click it in juicy.
            mainMatch.userAware = true;
            // console.log("Output Notification " + mainMatch.Selection + " | final isJuicy = " + mainMatch.isJuicy);
            // console.log("---------------------------------\n\n");
          }
          break;
        case 2:
          if (mainMatch.MatchRating >= this.matchRatingFilterNotification) {
            mainMatch = this.toastIt(mainMatch);
            //play audio if settings enables it
            (this.audioEnabled) ? this.playAudio() : null;
            mainMatch.isJuicy = true;
            mainMatch.userAware = true;
          }
          break;
        case 3:
          if (mainMatch.QLPercentage >= this.secretSauceNotification) {
            mainMatch = this.toastIt(mainMatch);
            //play audio if settings enables it
            (this.audioEnabled) ? this.playAudio() : null;
            mainMatch.isJuicy = true;
            mainMatch.userAware = true;
          }
          break;
        default:
          console.log("no entiendo");
      }
    }
    return mainMatch;
  }

  private toastIt(mainMatch: any) {
    //Display update
    //BUG REMOVED toFixed(2)
      var message: string = mainMatch.BackOdds.toFixed(2) + "<br>" + mainMatch.LayOdds;
      var title: string = mainMatch.Selection;
    //Creates an 'OnTap' listener. If they tap is. Change state to userAware = false.
    //This will reset popup Notifications to the user.
      this.showToast(message, title).onTap.subscribe( () => {
        //if toast is tapped, bring user to juicy table via this message.
        this.toastr(mainMatch);
      });
    return mainMatch;
  }

  //Brings to Juicy on click of Notification box
  //create a #mainMatch id tag for each popup. Reference it to an HTMLElement in JuicyTable.
  toastr(updatedMainMatch){
    setTimeout( () => {
      updatedMainMatch.isJuicy = false;
      //Sets notifications back on in the event they click the Toast Notification -> go to Juicy -> Do not take bet -> go back to Watchlist/Match-table -> Recieve new Odds within spec of that match.
      updatedMainMatch.userAware = false;
    }, 2000);
    var goToJuicyTable = { notificationIsActivated: true, matchObject: updatedMainMatch }
    this.clickSubject.next(goToJuicyTable);
  }


  getNotificationPing(): Observable<any>{
    return this.clickSubject.asObservable();
  }

  updateFilters(ev, mr, fvSelected, dateSelected){
    this.evNotificationFilter = ev;
    this.matchRatingFilterNotification = mr;
    this.fvSelected = fvSelected;
    this.tableDate = dateSelected;
  }
  //Need to discuss how to show midnight times.
  isInEpochLimits(epochNotifications, selection): boolean{
    var selectionTime = selection.EpochTime*1000;
    let result  = (selectionTime <= epochNotifications.upperLimit && selectionTime >= Date.now())
    console.log("-----------------Within EpochLimits ? " + result );
    console.log(  " selectionTime > current Time ? " + selectionTime >  Date.now() + " less than epochNotification Upper limit?  " +  selectionTime < epochNotifications.upperLimit );


    return result ;
  }

  playAudio(){
    if(this.userPropService.getAudioNotificationLock()){
      var audio = new Audio();
      audio.src = './assets/audio/notify2.mp3';
      audio.play();

      setTimeout( () => {
        this.userPropService.setAudioNotificationLock(true);
      } ,3000);
      this.userPropService.setAudioNotificationLock(false);
    }
  }


}
