import { Injectable, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatchStatsService } from '../services/match-stats.service';
import { Observable, Subject, from } from "rxjs";
import { MatchesService } from '../match/matches.service';
import { NotificationBoxService } from '../services/notification-box.service';


@Injectable({
  providedIn: 'root'
})
export class JuicyMatchHandlingService {
  private filteredMatches:any;
  private allIndividualMatchesArray: any;

  public singleMatchesUpdated = new Subject<any>();

  constructor(private matchStatService: MatchStatsService, private matchesService: MatchesService, private notificationService: NotificationBoxService) { }

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
    //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
    //TODO Also, timestamp showing last update.

    //If this streamChange meets criteria. send notification popup with sound.
    var valueChanged: boolean = false;
    // console.log("Stream Log");
    // console.log(juicyMatchStreamUpdate);
    // console.log(mainMatch);

    // //Detect change in BackOdds, trigger flicker animation.
    if(mainMatch.BackOdds != juicyMatchStreamUpdate.BackOdds)
    {
      mainMatch.BackOdds = juicyMatchStreamUpdate.BackOdds;
      console.log("BACKODDS UPDATED AT INDEX: " + index);
      mainMatch.backIsUpdated = true;
      valueChanged = true;
      setTimeout(()=>{
        mainMatch.backIsUpdated = false;
      }, 3000);
      console.log("backisUpdated: " + mainMatch.backIsUpdated);
      //pass action for animation here
    }
    //Detect change in Lay Odds, trigger flicker animation.
    if(mainMatch.LayOdds != juicyMatchStreamUpdate.LayOdds)
    {
      mainMatch.LayOdds = juicyMatchStreamUpdate.LayOdds;
      mainMatch.layIsUpdated = true;
      valueChanged = true;
      //delay setting property back to false to allow CSS animation and avoid rendering issues.
      setTimeout(()=>{
        mainMatch.layIsUpdated = false;
      }, 3000);
    }

    //TODO : handle notifications filters here?
    mainMatch = this.matchStatService.updateSelection(mainMatch);
    if(valueChanged){
      this.notificationService.showJuicyNotification(mainMatch);
    }
    // //Detect change in EVTotal, trigger flicker animation.
    // if(mainMatch.EVTotal != streamChangeMatch.EVTotal)
    // {
      //   mainMatch.EVTotal = streamChangeMatch.EVTotal;
      //   mainMatch.evIsUpdated = true;
      //   setTimeout( ()=>{
        //     mainMatch.evIsUpdated = false;
        //   }, 3000);
        // }


    // mainMatch.EVthisBet = streamChangeMatch.EVthisBet;
    // mainMatch.ReturnRating = streamChangeMatch.ReturnRating;
    // mainMatch.MatchRating = streamChangeMatch.MatchRating;
    // mainMatch.Liability = streamChangeMatch.Liability;
    // mainMatch.QL = streamChangeMatch.QL;
    // mainMatch.ROI = streamChangeMatch.ROI;
    // //Sets current b365 H/D/A odds to previous odds for reference in expanded drop down
    // mainMatch.b365HPrev = mainMatch.b365HCurr;
    // mainMatch.b365APrev = mainMatch.b365ACurr;

    // console.log(mainMatch);

    return mainMatch;
  }
}
