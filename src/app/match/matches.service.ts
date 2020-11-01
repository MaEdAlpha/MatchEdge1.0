import { HttpClient } from '@angular/common/http';
import {Match} from "./match.model";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root'})

export class MatchesService {
  private matches: any = [];
  private tableCount: any =[];
  count:number= 0;
  public matchesUpdated = new Subject<Match>();
  public matchesCountUpdated = new Subject<number>();

  constructor(private http: HttpClient) {}

  getMatches() {
    this.http
      .get<{ message: string; body: any }> (
        "http://localhost:3000/api/matches"
      )
      .pipe(map( (matchData) => {

        return matchData.body.map(match => {
          return {
            HReturn: 202,
            Home:match.HomeTeamName,
            Away:match.AwayTeamName,
            AReturn: 1+1*100,
            SMHome:match.SmarketsHomeOdds,
            SMAway:match.SmarketsAwayOdds,
            BHome:match.B365HomeOdds,
            BDraw:match.B365DrawOdds,
            BAway:match.B365AwayOdds,
            BTTSOdds:match.B365BTTSOdds,
            B25GOdds:match.B365O25GoalsOdds,
            Details:match.StartDateTime,
            MatchTime:match.StartDateTime.substring(11, 16),
            League:match.League,
            OccH: match.OccurrenceHome,
            OccA:match.OccurrenceAway,
          }
        })
      })) //add in operators (map()) every data through the observable stream do this thing.
      .subscribe( transformedMatches => {
        this.matches = transformedMatches;
        this.matchesUpdated.next(this.matches);
        // this.count=this.matches.length;
        // this.matchesCountUpdated.next(this.count);
        // console.log(this.count);
      });
  }

  getTableCount(){
    this.http
      .get<{ message: string; body: any }> (
        "http://localhost:3000/api/matches"
      )
      .pipe(map( (matchCount) => {

        return matchCount.body.map(match => {
          return{ match }
        })
      })) //add in operators (map()) every data through the observable stream do this thing.
      .subscribe( matchesCount => {
        this.tableCount = matchesCount;
        this.matchesCountUpdated.next(this.tableCount.length);
        console.log(this.tableCount.length);
      });

  }

  getMatchUpdateListener(){
    return this.matchesUpdated.asObservable();
  }


  getMatchCountListener(){
    return this.matchesCountUpdated.asObservable();
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
