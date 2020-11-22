import { Injectable } from '@angular/core';
import { MatchStatsService } from '../match-stats.service';

@Injectable({
  providedIn: 'root'
})
export class JuicyMatchHandlingService {
  private filteredMatches:any;


  constructor(private matchStatService: MatchStatsService) { }

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
