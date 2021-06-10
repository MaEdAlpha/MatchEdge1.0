import { Injectable } from '@angular/core';
import { GlobalConfig, ActiveToast, ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { DateHandlingService } from './date-handling.service';
import { MatchStatusService } from './match-status.service';
import { UserPropertiesService } from './user-properties.service';
import { SABToastSaveComponent } from '../sabtoast-save/sabtoast-save.component';
import { StreamNotificationsComponent } from '../stream-notifications/stream-notifications.component';
import { CustomToastComponent } from '../custom-toast/custom-toast.component';
import { SABToastDeleteComponent } from '../sabtoast-delete/sabtoast-delete.component';
import { SABToastUpdatedComponent } from '../sabtoast-updated/sabtoast-updated.component';
import { SABToastIncompleteComponent } from '../sabtoast-incomplete/sabtoast-incomplete.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationBoxService {

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
  //get container location from StrmNotComp

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService, private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService) {

      this.toastOptions = this.toast.toastrConfig;

      this.juicyFilterChange = this.userPropService.getUserPrefs().subscribe(filterSettings => {
        console.log("NOTIFICATION SETTINGS");

        console.log(filterSettings);

      this.matchRatingFilterNotification = +filterSettings.matchRatingFilterII,
      this.evNotificationFilter = +filterSettings.evFVII,
      this.secretSauceNotification = +filterSettings.secretSauceII,
      this.fvSelected = +filterSettings.fvSelected,
      this.tableDate = filterSettings.timeRange,
      this.audioEnabled = filterSettings.audioEnabled
    });
   }
  showNotification(){
    this.toast.success('Toastr Working', 'title');
  }

  showToast(message, title): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast = this.toast.show(message, title,{
      toastComponent:CustomToastComponent,
      onActivateTick: true,
      timeOut: 7000,
      tapToDismiss: true,
      progressBar: true,
      extendedTimeOut: 2000,
      enableHtml:true,
      toastClass: "toast border-gold",
      positionClass:'inline',
      messageClass: 'backOdds',
    });

    return toast;
  }

  //might have to disable the toastContainer somehow.

  showSABNotification(row:any):ActiveToast<any>{
    var toast: ActiveToast<any>;

    toast= this.toast.show( row.Selection + ' saved to Active Bets.', 'Saved!',{
      toastComponent: SABToastSaveComponent,
      onActivateTick: true,
      timeOut: 2000,
      disableTimeOut: false,
      tapToDismiss: true,
      toastClass: "toast border-gold",
      closeButton: true,
      messageClass: 'toast-message',
      positionClass:'toast-top-right',
    });

    //may cause issues.

   return toast
  }

  DeleteToastSAB(): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast= this.toast.show( ' ', 'Successfully Deleted!', {
      toastComponent: SABToastDeleteComponent,
      timeOut:1500,
      disableTimeOut: true,
      tapToDismiss: true,
      toastClass: "toast border-gold",
      messageClass: 'toast-message',
      positionClass:'toast-bottom-right',
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

  IncompleteSABToast(message:string): ActiveToast<any>{
    var toast: ActiveToast<any>;

    toast= this.toast.show(message, 'Bet Settled!', {
      toastComponent: SABToastIncompleteComponent,
      timeOut:2000,
      toastClass: "toast border-gold",
      messageClass: 'toast-message'
    } );
    return toast;
  }

  enableToggleToast(){
    this.toast.error('Re-Enable toggle to view League Matches.')
  }

  //TODO import Datehandling ranges
  showJuicyNotification(mainMatch: any){
    var epochNotifications = this.dateHandlingService.returnGenericNotificationBoundaries();
     this.audioEnabled = this.userPropService.getAudioPreferences();
    console.log("JUICY NOTIFICATION");

    console.log(mainMatch);

    //THIS IS THE BREAD AND BUTTER FOR TOAST. FIX isWatched~~~ SHOULD GET AN ACTUAL STATE OF JUICY. Match STATUS SHOULD BE GETTING THE ACTUAL STATE. SHOULD BE UPDATING MATCH STATUS SERVICES.
    if(this.matchStatusService.isWatched(mainMatch.Selection) && this.isInEpochLimits(epochNotifications, mainMatch) ) {
      console.log("BlackPool Conditional 1  Passed!");
      console.log(mainMatch);

      //DISPLAY TOAST IF match is set to Notify && user is not Aware of the match being Juicy.
      if(mainMatch.notify && !mainMatch.userAware ){
        console.log("CHECK TOAST~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        switch(this.fvSelected){
            case 1:
              if(mainMatch.EVthisBet >= this.evNotificationFilter && mainMatch.EVthisBet < 100000 ){
                console.log(mainMatch);

                  this.toastIt(mainMatch);
                  //play audio if settings enables it
                  (this.audioEnabled) ? this.playAudio() : null;
                  mainMatch.isJuicy = true;
                  //User is no aware of match being juicy. Therefore, they will not be notified of repeat updates until they click it in juicy.
                  mainMatch.userAware = true;
                }
                break;
            case 2:
              if( mainMatch.MatchRating >= this.matchRatingFilterNotification) {
                mainMatch = this.toastIt(mainMatch);
                //play audio if settings enables it
                (this.audioEnabled) ? this.playAudio() : null;
                mainMatch.isJuicy = true;
                mainMatch.userAware = true;
              }
              break;
            case 3:
              if(mainMatch.QLPercentage >= this.secretSauceNotification) {
                mainMatch = this.toastIt(mainMatch);
                //play audio if settings enables it
                (this.audioEnabled) ? this.playAudio() : null;
                mainMatch.isJuicy = true;
                mainMatch.userAware = true;
              }
              break;
            default:
              console.log("something didn't register");
            }
          }
      } else {
        console.log("In Empty SwitchCaseBlock ");
      }


    return mainMatch;
    // if( this.matchStatusService.isWatched(away.Selection) && (this.isInEpochLimits(epochNotifications, away) && (this.fvSelected && away.EVthisBet >= this.evNotificationFilter && away.EVthisBet < 100000 ) || ( this.fvSelected == 2 && away.MatchRating >= this.matchRatingFilterNotification) || (this.fvSelected == 3 && away.QLPercentage >= this.secretSauceNotification) ) ) {
    //   this.toast.success(away.Selection + ": </br> EV: " + away.EVthisBet + "</br> MR: " + away.MatchRating, "Click to view " + away.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
    //     console.log("SHOW NOTIFICATION!!!!");
    //     //When a user taps the notification.
    //     this.toastr(away);
    //   });
    // }
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
    return (selectionTime <= epochNotifications.upperLimit && selectionTime >= Date.now());
  }

  playAudio(){
    if(this.userPropService.getAudioNotificationLock()){
      var audio = new Audio();
      audio.src = './assets/audio/notify2.mp3';
      audio.play();

      setTimeout( () => {
        this.userPropService.setAudioNotificationLock(true);
        console.log("timeout lock set to : " + this.userPropService.getAudioNotificationLock());

      } ,3000);
      this.userPropService.setAudioNotificationLock(false);
      console.log("lock set to " + this.userPropService.getAudioNotificationLock());
    }
  }


}
