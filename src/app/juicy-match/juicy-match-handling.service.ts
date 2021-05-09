import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatchStatsService } from '../services/match-stats.service';
import { Observable, Subject, from } from "rxjs";
import { MatchesService } from '../match/matches.service';
import { NotificationBoxService } from '../services/notification-box.service';
import { UserPropertiesService } from '../services/user-properties.service';
import { MatchStatusService } from '../services/match-status.service';
import { JuicyMatch } from './juicy-match.model';


@Injectable({
  providedIn: 'root'
})
export class JuicyMatchHandlingService {

  public singleMatchesUpdated = new Subject<any>();
  private clearJuicyStyling = new Subject<boolean>();

  constructor(private matchStatService: MatchStatsService, private matchStatusService: MatchStatusService, private userPropertiesService: UserPropertiesService, private notificationService: NotificationBoxService) { }

  //Parses Fixtures into Selections
  getSingleMatches(_allMatches){
    var ftaOption: string = this.userPropertiesService.getFTAOption();
    var calcJuicyMatches: JuicyMatch[];
    console.log(ftaOption + " : FTAOPTION");

    if(_allMatches != undefined){

        calcJuicyMatches = this.matchStatService.getMatchStats(_allMatches, ftaOption); //Parses match Fixture into Selections.

      return calcJuicyMatches;

    } else  {
      console.log("Matches undefined!");
    }
  }


  getJuicyUpdateListener():Observable<any>{
    return this.singleMatchesUpdated.asObservable();
  }

  clearJuicyClicked(isClicked:boolean){
    if(isClicked){
      this.clearJuicyStyling.next(isClicked);
    }
  }

  listenToClearJuicyButton():Observable<any>{
    return this.clearJuicyStyling.asObservable();
  }


  updateSingleMatch(mainMatch, juicyMatchStreamUpdate, index){
    //If this streamChange meets criteria. send notification popup with sound.
    var valueChanged: boolean = false;
    var ftaOption: string = this.userPropertiesService.getFTAOption();
    console.log("-----Stream Log----");
    console.log("Stream");
    console.log(juicyMatchStreamUpdate);
    console.log("mainMatch");
    console.log(mainMatch);
    console.log("-----Stream Log----");
    juicyMatchStreamUpdate.BackOdds >= this.userPropertiesService.getMinOdds() && juicyMatchStreamUpdate.BackOdds <=  this.userPropertiesService.getMaxOdds() ? mainMatch.notify = true : mainMatch.notify = false;
    //Update notify boolean for watchList, incase any updates come in where odds drop, it should disable realtime in Watchlist.
    this.matchStatusService.updateWatchListFromStream(mainMatch);
    // //Detect change in BackOdds, trigger flicker animation.
    if(mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds || mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds )
    {
      console.log("BACKODDS UPDATED AT INDEX: " + index);
      mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds ? ( mainMatch.backIsUpdated = true && (mainMatch.BackOdds = juicyMatchStreamUpdate.BackOdds) ) : null;
      mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds ? ( mainMatch.layIsUpdated = true  && (mainMatch.LayOdds = juicyMatchStreamUpdate.LayOdds) ) : null;
      valueChanged = true;
      setTimeout(()=>{
        mainMatch.backIsUpdated = false;
        mainMatch.layIsUpdated = false;
      }, 3000);
    }

    mainMatch = this.matchStatService.updateSelection(mainMatch, ftaOption);
    mainMatch =  valueChanged ? this.notificationService.showJuicyNotification(mainMatch) : mainMatch;

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
