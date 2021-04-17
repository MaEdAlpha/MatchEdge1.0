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
  public evNotificationFilter: number = this.userPropService.getEV();
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
  showJuicyNotification(streamObj: any){
    var epochNotifications = this.dateHandlingService.returnGenericNotificationBoundaries();
    console.log(streamObj);

    if(this.matchStatusService.isWatched(streamObj.Selection) && (this.isInEpochLimits(epochNotifications, streamObj) && (this.isEVSelected == 1 && streamObj.EVthisBet >= this.evNotificationFilter && streamObj.EVthisBet < 100000 ) || (this.isEVSelected == 2 && streamObj.MatchRating >= this.matchRatingFilterNotification) || (this.isEVSelected == 3 && streamObj.QLPercentage >= this.secretSauceNotification) ) ) {
      this.toast.info(streamObj.Fixture + "</br>" + streamObj.Selection + "</br> Back: " + streamObj.BackOdds + "</br> Lay: " + streamObj.LayOdds).onTap.subscribe( (x) => {
        this.toastr(streamObj);
      });
    }

    // if( this.matchStatusService.isWatched(away.Selection) && (this.isInEpochLimits(epochNotifications, away) && (this.isEVSelected && away.EVthisBet >= this.evNotificationFilter && away.EVthisBet < 100000 ) || ( this.isEVSelected == 2 && away.MatchRating >= this.matchRatingFilterNotification) || (this.isEVSelected == 3 && away.QLPercentage >= this.secretSauceNotification) ) ) {
    //   this.toast.success(away.Selection + ": </br> EV: " + away.EVthisBet + "</br> MR: " + away.MatchRating, "Click to view " + away.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
    //     console.log("SHOW NOTIFICATION!!!!");
    //     //When a user taps the notification.
    //     this.toastr(away);
    //   });
    // }
  }

  toastr(selection){
    var goToJuicyTable = { notificationIsActivated: true, matchObject: selection }
    this.clickSubject.next(goToJuicyTable);
    // play audio
    if(selection.notify && !selection.userAware && !this.alertPlaying ){
      //play audio clip with timeout setting alertPlaying  = true.. play audio then set alerPlaying back to false.
      //change boolean to highlight row differently in JuicyMatch
      selection.userAware = true;
      selection.isJuicy = true;
    } else {
      //do not play audio clip.
    }
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
