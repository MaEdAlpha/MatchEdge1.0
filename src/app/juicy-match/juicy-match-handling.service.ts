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
  updateSingleMatch(juicyMatchBase, juicyMatchStreamUpdate, index){

    var oddsChanged: boolean = false;
    var ftaOption: string = this.userPropertiesService.getFTAOption();
    // DEBUG
    console.log("--------Comparint Stream with Juicy Selection--------");
    console.log(juicyMatchBase);
    console.log("-----------------------------------------------------\n");

    //THIS CODE should trigger your matches to disable notify if not in min Max odds range. //DO WE WANT THIS????
    this.incomingStreamBetweenMinMaxOdds(juicyMatchStreamUpdate, juicyMatchBase);
    // If stream odds are within user min/max odds BUT currrent match is less than min odds. set match.notify = true.
    this.incomingStreamBetweenMinMaxOddsAndCurrentOddsIsNot(juicyMatchStreamUpdate, juicyMatchBase);
    //Update notify boolean for watchList, incase any updates come in where odds drop, it should disable realtime in Watchlist.
    this.matchStatusService.updateWatchListFromStream(juicyMatchBase);
    // //Detect change in BackOdds, trigger flicker animation.
    oddsChanged = this.triggerJuicyFlickerAnimation(juicyMatchBase, juicyMatchStreamUpdate, index, oddsChanged);

    juicyMatchBase = this.matchStatService.updateSelection(juicyMatchBase, ftaOption);
    juicyMatchBase =  oddsChanged ? this.notificationService.showJuicyNotification(juicyMatchBase) : juicyMatchBase;

    return juicyMatchBase;
  }


  private triggerJuicyFlickerAnimation(mainMatch: any, streamUpdate: any, index: any, oddsChanged: boolean) {
    if (mainMatch.BackOdds != streamUpdate.BackOdds || mainMatch.LayOdds != streamUpdate.LayOdds) {
      console.log("Trigger Flicker for: " + mainMatch.Selection);
      juicyMatchBackOddsUpdated(mainMatch, streamUpdate);
      juicyMatchLayOddsUpdated(mainMatch, streamUpdate);
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
    juicyMatchStreamUpdate.BackOdds >= this.userPropertiesService.getMinOdds() && juicyMatchStreamUpdate.BackOdds <= this.userPropertiesService.getMaxOdds() && mainMatch.isWatched && mainMatch.BackOdds < this.userPropertiesService.getMinOdds() ? mainMatch.notify = true : null;
  }
}

function juicyMatchLayOddsUpdated(mainMatch: any, streamUpdate: any) {
  mainMatch.LayOdds != streamUpdate.LayOdds ? (mainMatch.layIsUpdated = true && (mainMatch.LayOdds = streamUpdate.LayOdds)) : null;
}

function juicyMatchBackOddsUpdated(mainMatch: any, streamUpdate: any) {
  mainMatch.BackOdds != streamUpdate.BackOdds ? (mainMatch.backIsUpdated = true && (mainMatch.BackOdds = streamUpdate.BackOdds)) : null;
}

