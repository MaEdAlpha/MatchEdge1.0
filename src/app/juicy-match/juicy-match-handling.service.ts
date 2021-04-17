import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatchStatsService } from '../services/match-stats.service';
import { Observable, Subject, from } from "rxjs";
import { MatchesService } from '../match/matches.service';
import { NotificationBoxService } from '../services/notification-box.service';
import { UserPropertiesService } from '../services/user-properties.service';
import { MatchStatusService } from '../services/match-status.service';


@Injectable({
  providedIn: 'root'
})
export class JuicyMatchHandlingService {

  public singleMatchesUpdated = new Subject<any>();

  constructor(private matchStatService: MatchStatsService, private matchStatusService: MatchStatusService, private userPropertiesService: UserPropertiesService, private notificationService: NotificationBoxService) { }

  //Parses Fixtures into Selections
  getSingleMatches(_allMatches){

    if(_allMatches != undefined){
      _allMatches.forEach((match) => {
        this.matchStatService.getMatchStats(match); //Parses match Fixture into Selections.
      });
      return this.matchStatService.getAllSingleMatches();
    } else  {
      console.log("Matches List is empty!");
    }
  }


  getJuicyUpdateListener():Observable<any>{
    return this.singleMatchesUpdated.asObservable();
  }


  updateSingleMatch(mainMatch, juicyMatchStreamUpdate, index){
    //If this streamChange meets criteria. send notification popup with sound.
    var valueChanged: boolean = false;
    // console.log("Stream Log");
    // console.log(juicyMatchStreamUpdate);
     console.log(mainMatch);
    juicyMatchStreamUpdate.BackOdds >= this.userPropertiesService.getMinOdds() && juicyMatchStreamUpdate.BackOdds <=  this.userPropertiesService.getMaxOdds() ? mainMatch.notify = true : mainMatch.notify = false;
    //Update notify boolean for watchList, incase any updates come in where odds drop, it should disable realtime in Watchlist.
    this.matchStatusService.updateWatchListFromStream(mainMatch);
    // //Detect change in BackOdds, trigger flicker animation.
    if(mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds || mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds )
    {
      console.log("BACKODDS UPDATED AT INDEX: " + index);
      mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds ?( mainMatch.backIsUpdated = true && (mainMatch.BackOdds = juicyMatchStreamUpdate.BackOdds) ) : null;
      mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds ? ( mainMatch.layIsUpdated = true  && (mainMatch.LayOdds = juicyMatchStreamUpdate.LayOdds) ) : null;
      valueChanged = true;
      setTimeout(()=>{
        mainMatch.backIsUpdated = false;
        mainMatch.layIsUpdated = false;
      }, 3000);
    }

    //TODO : handle notifications filters here?
    mainMatch = this.matchStatService.updateSelection(mainMatch);
    if(valueChanged) this.notificationService.showJuicyNotification(mainMatch);

    // //Detect change in EVTotal, trigger flicker animation.
    // if(mainMatch.EVTotal != streamChangeMatch.EVTotal)
    // {
      //   mainMatch.EVTotal = streamChangeMatch.EVTotal;
      //   mainMatch.evIsUpdated = true;
      //   setTimeout( ()=>{
        //     mainMatch.evIsUpdated = false;
        //   }, 3000);
        // }

    return mainMatch;
  }
}
