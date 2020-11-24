import { Injectable, EventEmitter } from '@angular/core';
import { MatchStatsService } from '../match-stats.service';
import { Observable, Subject, from } from "rxjs";
import { JuicyMatch } from './juicy-match.model';
import { MatchesService } from '../match/matches.service';

@Injectable({
  providedIn: 'root'
})
export class JuicyMatchHandlingService {
  private filteredMatches:any;
  private allIndividualMatchesArray: any;

  public singleMatchesUpdated = new Subject<any>();
  updateAllMatches = new EventEmitter<any>();

  constructor(private matchStatService: MatchStatsService, private matchesService: MatchesService) { }

  getSingleMatches(_allMatches){

    if(_allMatches != undefined){
      _allMatches.forEach((match) => {
        this.matchStatService.getMatchStats(match); //want to push this into filteredMatches
      });
    }
    return this.matchStatService.getAllSingleMatches();
  }

  listenToChangeStream(){
    this.matchesService.streamDataUpdate.subscribe( (x) => {
      console.log("HI in ChangeStream JM Services:" + x) ;

    });
  }
  setCloseMatchList(_allMatches)
  {
    if(_allMatches !== undefined){
      _allMatches.forEach((match) => {
        this.matchStatService.getMatchStats(match); //want to push this into filteredMatches
      });

      //make your subject for each single match
      from(this.matchStatService.getAllSingleMatches())
      .subscribe((singleMatchesArr) => {
        this.allIndividualMatchesArray = singleMatchesArr;
        this.singleMatchesUpdated.next(this.allIndividualMatchesArray);
      });
      return this.allIndividualMatchesArray;
    }

  }

  getJuicyUpdateListener():Observable<any>{
    return this.singleMatchesUpdated.asObservable();
  }

  setJuicyMatches(_allMatches: any) {

    if(_allMatches !== undefined){
      _allMatches.forEach((match) => {
        this.matchStatService.getMatchStats(match); //want to push this into filteredMatches
      });

      this.filteredMatches = this.matchStatService.getJuicyMatches();
      return this.filteredMatches;
    }
   }

  filter(matches: any)
  {
    console.log(matches);
  }

  //Takes in the matches array and filters it via equations you specify. If passes specs, it should return these matches in juicy-match.component
  isCheckingForUpdate(matchesCopy:any){
    //return this.filteredMatches();

  }
}
