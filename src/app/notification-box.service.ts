import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { DateHandlingService } from './date-handling.service';
import { UserPropertiesService } from './user-properties.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationBoxService {

  public matchRatingFilter: number = this.userPropService.getMR();
  public evRatingFilter: number = this.userPropService.getEV();
  public isEVSelected: boolean = this.userPropService.getFilterBoolean();
  public tableDate: string = this.userPropService.getSelectedDate();
  private clickSubject = new Subject<{notificationIsActivated: boolean, matchObject: any }>();

  juicyFilterChange: Subscription;

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService, private dateHandlingService: DateHandlingService) {

      this.juicyFilterChange = this.userPropService.getUserPrefs().subscribe(filterSettings => {
      this.matchRatingFilter = +filterSettings.maxRatingFilter,
      this.evRatingFilter = +filterSettings.evFilterValue,
      this.isEVSelected = filterSettings.isEvSelected,
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

    console.log("Current Filter Settings: Notify based off EV = " + this.isEVSelected + " Match Rating Filter = " + this.matchRatingFilter + " EV Filter = " + this.evRatingFilter);

    //Need to check if already in Juicy Matches. if()
    if( this.isInEpochLimits(epochNotifications, home) && (this.isEVSelected && home.EVthisBet >= this.evRatingFilter && home.EVthisBet < 100000 ) || (!this.isEVSelected && home.MatchRating >= this.matchRatingFilter) ) {
      this.toast.info(home.Selection + ": </br> EV: " + home.EVthisBet + "</br> MR: " + home.MatchRating, "Click to view " + home.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
        this.toastr(home);
      });
    }

    if( this.isInEpochLimits(epochNotifications, away) && (this.isEVSelected && away.EVthisBet >= this.evRatingFilter && away.EVthisBet < 100000 ) || ( !this.isEVSelected && away.MatchRating >= this.matchRatingFilter) ){
      this.toast.success(away.Selection + ": </br> EV: " + away.EVthisBet + "</br> MR: " + away.MatchRating, "Click to view " + away.Selection + " in Juicy Match.").onTap.subscribe( (x) => {
        //When a user taps the notification.
        this.toastr(away);
      });
    }
  }

  toastr(selection){
    var goToJuicyTable = { notificationIsActivated:false, matchObject: ""};
    goToJuicyTable = { notificationIsActivated: true, matchObject: selection };
    console.log(goToJuicyTable);

    this.clickSubject.next(goToJuicyTable);
  }


  getNotificationPing(): Observable<any>{
    return this.clickSubject.asObservable();
  }

  updateFilters(ev, mr, isEVSelected, dateSelected){
    this.evRatingFilter = ev;
    this.matchRatingFilter = mr;
    this.isEVSelected = isEVSelected;
    this.tableDate = dateSelected;
  }
  //Need to discuss how to show midnight times.
  isInEpochLimits(epochNotifications, selection): boolean{
    var selectionTime = selection.EpochTime*1000;
    console.log(selection);

    return (selectionTime <= epochNotifications.upperLimit && selectionTime >= epochNotifications.lowerLimit);
  }
}
