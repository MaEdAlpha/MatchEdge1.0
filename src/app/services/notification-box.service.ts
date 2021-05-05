import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { DateHandlingService } from './date-handling.service';
import { MatchStatusService } from './match-status.service';
import { UserPropertiesService } from './user-properties.service';

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
  private alertPlaying: boolean = false;
  private audioEnabled: boolean = this.userPropService.getAudioPreferences();
  private notificationActive: boolean = this.userPropService.getNotificationLock();

  juicyFilterChange: Subscription;
  matchStatus:Subscription;

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService, private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService) {

      this.juicyFilterChange = this.userPropService.getUserPrefs().subscribe(filterSettings => {
      this.matchRatingFilterNotification = +filterSettings.matchRatingFilterII,
      this.evNotificationFilter = +filterSettings.evFVI,
      this.secretSauceNotification = +filterSettings.secretSauceII,
      this.fvSelected = +filterSettings.fvSelected,
      this.tableDate = filterSettings.timeRange
    });
   }
  showNotification(){
    this.toast.success('Toastr Working', 'title');
  }

  enableToggleToast(){
    this.toast.error('Re-Enable toggle to view League Matches.')
  }

  //TODO import Datehandling ranges
  showJuicyNotification(mainMatch: any){
    var epochNotifications = this.dateHandlingService.returnGenericNotificationBoundaries();
    console.log(mainMatch);

    if(this.matchStatusService.isWatched(mainMatch.Selection) && this.isInEpochLimits(epochNotifications, mainMatch) ) {

      if(mainMatch.notify && !mainMatch.userAware ){
        switch(this.fvSelected){
            case 1:
              if(mainMatch.EVthisBet >= this.evNotificationFilter && mainMatch.EVthisBet < 100000 ){
                  this.toastIt(mainMatch);
                  //play audio if settings enables it
                  (this.audioEnabled) ? this.playAudio() : null;
                  mainMatch.isJuicy = true;
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
      var message: string = "<div class='subheader'> " + mainMatch.Selection + "</div> <div class='backOdds'> Back: " + mainMatch.BackOdds + "</div> <div class='layOdds'></br> Lay: " + mainMatch.LayOdds +"</div>";
      var title: string = mainMatch.Fixture;
      this.showToast(message, title).onTap.subscribe( () => {
        //if toast is tapped, bring user to juicy table via this message.
        this.toastr(mainMatch);
      });

    return mainMatch;
  }

  //Brings to Juicy on Top
  //create a #mainMatch id tag for each popup. Reference it to an HTMLElement in JuicyTable.
  toastr(updatedMainMatch){
    setTimeout( () => {
      updatedMainMatch.isJuicy = false;
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
    if(this.userPropService.getNotificationLock()){
      var audio = new Audio();
      audio.src = './assets/audio/notify2.mp3';
      audio.play();

      setTimeout( () => {
        this.userPropService.setNotificationLock(true);
        console.log("timeout lock set to : " + this.userPropService.getNotificationLock());

      } ,3000);
      this.userPropService.setNotificationLock(false);
      console.log("lock set to " + this.userPropService.getNotificationLock());
    }
  }

  showToast(message, title): ActiveToast<any>{
    var toast: ActiveToast<any>;
    toast = this.toast.show(message, title,{
      disableTimeOut: false,
      tapToDismiss: true,
      toastClass: "toast border-gold",
      closeButton: false,
      positionClass:'toast-bottom-right',
      messageClass: 'backOdds',
    });

    return toast;
  }
}
