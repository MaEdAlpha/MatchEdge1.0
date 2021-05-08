import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable, EventEmitter } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';



@Injectable({ providedIn: 'root'})

export class MatchesService {

  //Broadcasts WS Data
  streamDataUpdate = new EventEmitter<any>();
  loadPage = new EventEmitter<boolean>();
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
            Home: match.HomeTeamName,
            Away: match.AwayTeamName,
            SMHome: +match.SmarketsHomeOdds,
            SMAway: +match.SmarketsAwayOdds,
            BHome: match.B365HomeOdds,
            BDraw: match.B365DrawOdds,
            BAway: match.B365AwayOdds,
            BTTSOdds: match.B365BTTSOdds,
            B25GOdds: match.B365O25GoalsOdds,
            Details: match.StartDateTime,
            LocaleDate: new Date(match.unixDateTimestamp * 1000),
            EpochTime: match.unixDateTimestamp,
            League: match.League,
            OccH: match.OccurrenceHome,
            OccA: match.OccurrenceAway,
            GenericOcc: 65,
            UrlB365: match.URLB365,
            UrlSmarkets: 'https://'+ match.URLSmarkets,
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

  loadingMatches(isDone:boolean){
    this.loadPage.emit(isDone);
  }

  updateMatch(match, streamMatch){
    if(streamMatch.SmarketsHomeOdds != 0 && streamMatch.SmarketsAwayOdds != 0)
    {
      match.SMHome = streamMatch.SmarketsHomeOdds;
      match.SMAway = streamMatch.SmarketsAwayOdds;
    }
    if(streamMatch.B365HomeOdds != 0 && streamMatch.B365AwayOdds != 0)
    {
      match.BHome = streamMatch.B365HomeOdds;
      match.BAway = streamMatch.B365AwayOdds;
    }
    if(streamMatch.OccurrenceAway != 0){
      match.BTTSOdds = streamMatch.B365BTTSOdds;
      match.B25GOdds = streamMatch.B365O25GoalsOdds;
      match.BDraw = streamMatch.B365DrawOdds;
      match.OccH = streamMatch.OccurrenceHome;
      match.OccA = streamMatch.OccurrenceAway;
    }

    return match
  }


}
