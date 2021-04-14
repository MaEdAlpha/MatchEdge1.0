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
  showJuicyNotification(streamMatchesArray: any){

    var home = streamMatchesArray[0];
    var away = streamMatchesArray[1];
    var epochNotifications = this.dateHandlingService.returnGenericNotificationBoundaries();

    console.log("Current Filter Settings: Notify based off EV = " + this.isEVSelected + " Match Rating Filter = " + this.matchRatingFilterNotification + " EV Filter = " + this.evNotificationFilter);

    //Need to check if already in Juicy Matches. if()
    if(this.matchStatusService.isWatched(home.Selection) && (this.isInEpochLimits(epochNotifications, home) && (this.isEVSelected == 1 && home.EVthisBet >= this.evNotificationFilter && home.EVthisBet < 100000 ) || (this.isEVSelected == 2 && home.MatchRating >= this.matchRatingFilterNotification) || (this.isEVSelected == 3 && home.QLPercentage >= this.secretSauceNotification) ) ) {
      this.toast.info(home.Selection + ": </br> EV: " + home.EVthisBet + "</br> MR: " + home.MatchRating, "Click to view " + home.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
        this.toastr(home);
      });
    }

    if( this.matchStatusService.isWatched(away.Selection) && (this.isInEpochLimits(epochNotifications, away) && (this.isEVSelected && away.EVthisBet >= this.evNotificationFilter && away.EVthisBet < 100000 ) || ( this.isEVSelected == 2 && away.MatchRating >= this.matchRatingFilterNotification) || (this.isEVSelected == 3 && away.QLPercentage >= this.secretSauceNotification) ) ) {
      this.toast.success(away.Selection + ": </br> EV: " + away.EVthisBet + "</br> MR: " + away.MatchRating, "Click to view " + away.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
        //When a user taps the notification.
        this.toastr(away);
      });
    }
  }

  toastr(selection){
    //maybe useless line of code... MongoStream is buggy with an open DB it seems
    var goToJuicyTable = { notificationIsActivated:false, matchObject: ""};
    goToJuicyTable = { notificationIsActivated: true, matchObject: selection };
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
