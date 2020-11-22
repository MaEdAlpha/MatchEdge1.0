import { Injectable, OnInit } from '@angular/core';
import { Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsJuicyService {
  allMatches: any;

  constructor(private otherMatchesService: MatchesService) { }

  setAllmatches(match: any) {
   this.allMatches = match;
   return this.allMatches;
  }

  checkMatch(match: any){
    this.allMatches = match;
    console.log(this.allMatches);
  }
  matchByEquationA(variableA: string, variableB: string, userPreferenceA: number, userPreferenceB: number){
    if(variableA == variableB  &&  userPreferenceA < userPreferenceB)
    {
      return true;
    } else {
      return false;
    }
  }

  //Show these
  calcFullTurnAround(){

  }

  calcROI(){

  }

  calcEVthisBet(){

  }

  calcMatchRating () {

  }


}
