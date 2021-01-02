import { HttpClient } from '@angular/common/http';
import { Match } from "./match.model";
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable, EventEmitter } from '@angular/core';



@Injectable({ providedIn: 'root'})

export class MatchesService {
  private matches: any;

  streamDataUpdate = new EventEmitter<any>();

  public matchesUpdated = new Subject<any>();

  constructor(private http: HttpClient) {}
  //TODO update all Emitters to Observables
  getMatches() {

    this.http
      .get<{body: any[]}> (
        "http://localhost:3000/api/matches"
      )
      .pipe(map( (matchData) => {

        return matchData.body.map( match => {
          return {
            HReturn: 202,
            Home: match.HomeTeamName,
            Away: match.AwayTeamName,
            AReturn: 1+1*100,
            SMHome: match.SmarketsHomeOdds,
            SMAway: match.SmarketsAwayOdds,
            BHome: match.B365HomeOdds,
            BDraw: match.B365DrawOdds,
            BAway: match.B365AwayOdds,
            BTTSOdds: match.B365BTTSOdds,
            B25GOdds: match.B365O25GoalsOdds,
            Details: match.StartDateTime,
            MatchTime: match.StartDateTime.substring(11, 16),
            MatchDate: match.StartDateTime.substring(0,6) + match.StartDateTime.substring(8,11),
            League: match.League,
            OccH: match.OccurrenceHome,
            OccA: match.OccurrenceAway,
            UrlB365: match.URLB365,
            UrlSmarkets: match.URLSmarkets,
            HStatus: {notify: false, activeBet: false, ignore: false },
            AStatus: {notify: false, activeBet: false, ignore: false }
          }
        })
      }))
      .subscribe( transformedMatches => {
        this.matches = transformedMatches;
        this.matchesUpdated.next(this.matches);
      });
  }

  getMatchUpdateListener(): Observable<any[]> {
     return this.matchesUpdated.asObservable();
  }

  addToUpdatedMatches(_streamObj){
    this.streamDataUpdate.emit(_streamObj);
  }
}
