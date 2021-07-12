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
    console.log(ftaOption + " : FTA_OPTION");

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

  //Triggers Odds Update Animation and Notifications.
  updateSingleMatch(mainMatch, juicyMatchStreamUpdate, index){

    var oddsChanged: boolean = false;
    var ftaOption: string = this.userPropertiesService.getFTAOption();
    // DEBUG
    console.log("-----Stream Log----");
    console.log("Stream");
    console.log(juicyMatchStreamUpdate);
    console.log("mainMatch");
    console.log(mainMatch);
    console.log("-----Stream Log----");

    //THIS CODE should trigger your matches to disable notify if not in min Max odds range. //DO WE WANT THIS????
    this.incomingStreamBetweenMinMaxOdds(juicyMatchStreamUpdate, mainMatch);
    // If stream odds are within user min/max odds BUT currrent match is less than min odds. set match.notify = true.
    this.incomingStreamBetweenMinMaxOddsAndCurrentOddsIsNot(juicyMatchStreamUpdate, mainMatch);
    //Update notify boolean for watchList, incase any updates come in where odds drop, it should disable realtime in Watchlist.
    this.matchStatusService.updateWatchListFromStream(mainMatch);
    // //Detect change in BackOdds, trigger flicker animation.
    oddsChanged = this.triggerJuicyFlickerAnimation(mainMatch, juicyMatchStreamUpdate, index, oddsChanged);

    mainMatch = this.matchStatService.updateSelection(mainMatch, ftaOption);
    mainMatch =  oddsChanged ? this.notificationService.showJuicyNotification(mainMatch) : mainMatch;

    return mainMatch;
  }


  private triggerJuicyFlickerAnimation(mainMatch: any, juicyMatchStreamUpdate: any, index: any, oddsChanged: boolean) {
    if (mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds || mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds) {
      console.log("BACKODDS UPDATED AT INDEX: " + index);
      juicyMatchBackOddsUpdated(mainMatch, juicyMatchStreamUpdate);
      juicyMatchLayOddsUpdated(mainMatch, juicyMatchStreamUpdate);
      oddsChanged = true;
      setTimeout(() => {
        mainMatch.backIsUpdated = false;
        mainMatch.layIsUpdated = false;
      }, 3000);
    }
    return oddsChanged;
  }

  private incomingStreamBetweenMinMaxOdds(juicyMatchStreamUpdate: any, mainMatch: any) {
    //refactor. Test. just set null to mainMatch.notify = true. No need to do second qualifier. (method below.)
    juicyMatchStreamUpdate.BackOdds >= this.userPropertiesService.getMinOdds() && juicyMatchStreamUpdate.BackOdds <= this.userPropertiesService.getMaxOdds() && mainMatch.isWatched ? null : mainMatch.notify = false;
  }
  private incomingStreamBetweenMinMaxOddsAndCurrentOddsIsNot(juicyMatchStreamUpdate: any, mainMatch: any) {
    //Why not combine the two? Did I do this for a reason I forgot about?
    juicyMatchStreamUpdate.BackOdds >= this.userPropertiesService.getMinOdds() && juicyMatchStreamUpdate.BackOdds <= this.userPropertiesService.getMaxOdds() && mainMatch.isWatched && mainMatch.BackOdds <= this.userPropertiesService.getMinOdds() ? mainMatch.notify = true : null;
  }
}

function juicyMatchLayOddsUpdated(mainMatch: any, juicyMatchStreamUpdate: any) {
  mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds ? (mainMatch.layIsUpdated = true && (mainMatch.LayOdds = juicyMatchStreamUpdate.LayOdds)) : null;
}

function juicyMatchBackOddsUpdated(mainMatch: any, juicyMatchStreamUpdate: any) {
  mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds ? (mainMatch.backIsUpdated = true && (mainMatch.BackOdds = juicyMatchStreamUpdate.BackOdds)) : null;
}

