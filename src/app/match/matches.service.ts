import { HttpClient } from '@angular/common/http';
import {Match} from "./match.model";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root'})

export class MatchesService {
  private matches: any = [];
  public matchesUpdated = new Subject<Match>();

  constructor(private http: HttpClient) {}

  getMatches() {
    this.http
      .get<{ message: string; body: any }> (
        "http://localhost:3000/api/matches"
      )
      .pipe(map( (matchData) => {

        return matchData.body.map(match => {
          return {
            RefTag: match.RefTag,
            HomeTeamName:match.HomeTeamName,
            AwayTeamName:match.AwayTeamName,
            SmarketsHomeOdds:match.SmarketsHomeOdds,
            SmarketsAwayOdds:match.SmarketsAwayOdds,
            B365HomeOdds:match.B365HomeOdds,
            B365DrawOdds:match.B365DrawOdds,
            B365AwayOdds:match.B365AwayOdds,
            B365BTTSOdds:match.B365BTTSOdds,
            B365O25GoalsOdds:match.B365O25GoalsOdds,
            StartDateTime:match.StartDateTime,
            League:match.League,
            OccurrenceHome: match.OccurrenceHome,
            OccurrenceAway:match.OccurrenceAway,
          }
        })
      })) //add in operators (map()) every data through the observable stream do this thing.
      .subscribe( transformedMatches => {
        this.matches =transformedMatches;
        this.matchesUpdated.next(this.matches);
      });
  }

  getMatchUpdateListener(){
    return this.matchesUpdated.asObservable();
  }

  addMatches(RefTag: string,
    HomeTeamName:string,
    AwayTeamName:string,
    SmarketsHomeOdds:number,
    SmarketsAwayOdds:number,
    B365HomeOdds:number,
    B365DrawOdds:number,
    B365AwayOdds:number,
    B365BTTSOdds:number,
    B365O25GoalsOdds:number,
    StartDateTime:string,
    League:string,
    OccurrenceHome: number,
    OccurrenceAway:number,
    ){
    const match: Match = {
      RefTag: RefTag,
      HomeTeamName:HomeTeamName,
      AwayTeamName:AwayTeamName,
      SmarketsHomeOdds:SmarketsHomeOdds,
      SmarketsAwayOdds:SmarketsAwayOdds,
      B365HomeOdds:B365HomeOdds,
      B365DrawOdds:B365DrawOdds,
      B365AwayOdds:B365AwayOdds,
      B365BTTSOdds:B365BTTSOdds,
      B365O25GoalsOdds:B365O25GoalsOdds,
      StartDateTime:StartDateTime,
      League:League,
      OccurrenceHome: OccurrenceHome,
      OccurrenceAway:OccurrenceAway,

    };
    this.matches.push(match);
    this.matchesUpdated.next(this.matches);
  }
}
