import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable, EventEmitter } from '@angular/core';



@Injectable({ providedIn: 'root'})

export class MatchesService {

  //Broadcasts WS Data
  streamDataUpdate = new EventEmitter<any>();
  //Creates an Observable of all Fixtures
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
            SMHome: +match.SmarketsHomeOdds,
            SMAway: +match.SmarketsAwayOdds,
            BHome: match.B365HomeOdds,
            BDraw: match.B365DrawOdds,
            BAway: match.B365AwayOdds,
            BTTSOdds: match.B365BTTSOdds,
            B25GOdds: match.B365O25GoalsOdds,
            Details: match.StartDateTime,
            League: match.League,
            OccH: match.OccurrenceHome,
            OccA: match.OccurrenceAway,
            UrlB365: match.URLB365,
            UrlSmarkets: match.URLSmarkets,
            PreviousB365HomeOdds: match.PreviousB365HomeOdds,
            PreviousB365AwayOdds: match.PreviousB365AwayOdds,
            HStatus: {notify: false, activeBet: false, ignore: false },
            AStatus: {notify: false, activeBet: false, ignore: false },
            isWatched: false
          }
        })
      }))
      .subscribe( transformedMatches => {
        this.matchesUpdated.next(transformedMatches);
      });
  }

  getMatchUpdateListener(): Observable<any[]> {
     return this.matchesUpdated.asObservable();
  }

  addToUpdatedMatches(_streamObj){
    this.streamDataUpdate.emit(_streamObj);
  }
}
