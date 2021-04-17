import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
  public isEVSelected: number = this.userPropService.getFilterSelection();
  public tableDate: string = this.userPropService.getSelectedDate();
  private clickSubject = new Subject<{notificationIsActivated: boolean, matchObject: any }>();
  private alertPlaying: boolean = false;

  juicyFilterChange: Subscription;
  matchStatus:Subscription;

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService, private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService) {

      this.juicyFilterChange = this.userPropService.getUserPrefs().subscribe(filterSettings => {
      this.matchRatingFilterNotification = +filterSettings.matchRatingFilterII,
      this.evNotificationFilter = +filterSettings.evFilterValueII,
      this.secretSauceNotification = +filterSettings.secretSauceII,
      this.isEVSelected = +filterSettings.isEvSelected,
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
      switch(this.isEVSelected){
        case 1:
          if(mainMatch.EVthisBet >= this.evNotificationFilter && mainMatch.EVthisBet < 100000 ){
            console.log(mainMatch);

            // play audio
            if(mainMatch.notify && !mainMatch.userAware ){
              //play audio clip with timeout setting alertPlaying  = true.. play audio then set alerPlaying back to false.
              //change boolean to highlight row differently in JuicyMatch
              console.log("IN EV");
              mainMatch.isJuicy = true;
              mainMatch.userAware = true;

              return mainMatch;
            } else {
              console.log("In Second ");
            }
            mainMatch = this.toastIt(mainMatch);
          }
          break;
        case 2:
          if( mainMatch.MatchRating >= this.matchRatingFilterNotification) {
            mainMatch = this.toastIt(mainMatch);
          }
          break;
        case 3:
          if(mainMatch.QLPercentage >= this.secretSauceNotification) {
            mainMatch = this.toastIt(mainMatch);
          }
          break;
          default:
            console.log("something didn't register");
      }

    }

    return mainMatch;
    // if( this.matchStatusService.isWatched(away.Selection) && (this.isInEpochLimits(epochNotifications, away) && (this.isEVSelected && away.EVthisBet >= this.evNotificationFilter && away.EVthisBet < 100000 ) || ( this.isEVSelected == 2 && away.MatchRating >= this.matchRatingFilterNotification) || (this.isEVSelected == 3 && away.QLPercentage >= this.secretSauceNotification) ) ) {
    //   this.toast.success(away.Selection + ": </br> EV: " + away.EVthisBet + "</br> MR: " + away.MatchRating, "Click to view " + away.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
    //     console.log("SHOW NOTIFICATION!!!!");
    //     //When a user taps the notification.
    //     this.toastr(away);
    //   });
    // }
  }

  private toastIt(mainMatch: any) {
    this.toast.info(mainMatch.Fixture + "</br>" + mainMatch.Selection + "</br> Back: " + mainMatch.BackOdds + "</br> Lay: " + mainMatch.LayOdds).onTap.subscribe((x) => {
      mainMatch = this.toastr(mainMatch);
    });
    return mainMatch;
  }

  //Brings to Juicy on Top
  toastr(updatedMainMatch){
    var goToJuicyTable = { notificationIsActivated: true, matchObject: updatedMainMatch }
    this.clickSubject.next(goToJuicyTable);

  }


  getNotificationPing(): Observable<any>{
    return this.clickSubject.asObservable();
  }

  updateFilters(ev, mr, isEVSelected, dateSelected){
    this.evNotificationFilter = ev;
    this.matchRatingFilterNotification = mr;
    this.isEVSelected = isEVSelected;
    this.tableDate = dateSelected;
  }
  //Need to discuss how to show midnight times.
  isInEpochLimits(epochNotifications, selection): boolean{
    var selectionTime = selection.EpochTime*1000;
    return (selectionTime <= epochNotifications.upperLimit && selectionTime >= epochNotifications.lowerLimit);
  }
}
