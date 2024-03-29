import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Injectable, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { environment as env } from '../../environments/environment.prod';
import { Router } from '@angular/router';
import { ActiveBet } from '../models/active-bet.model';
import { PopupViewSavedBetsComponent } from '../popup-view-saved-bets/popup-view-saved-bets.component';



@Injectable({ providedIn: 'root'})

export class MatchesService {

  //Broadcasts WS Data
  streamDataUpdate = new EventEmitter<any>();
  loadPage = new EventEmitter<boolean>();
  viewSubscriptionsPage = new EventEmitter<boolean>();
  //Creates an Observable of all Fixtures
  public matchesUpdated = new Subject<any>();
  public refreshTableSubject = new Subject<any>();

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {}
  //TODO update all Emitters to Observables
  getMatches() {
    this.http
      .get<{body: any[]}> (
        env.serverUrl + "/api/matches"
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
            isWatched: false,
            homeLayOddsFlicker: false,
            awayLayOddsFlicker: false,
            homeBackOddsFlicker: false,
            awayBackOddsFlicker: false,
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

  triggerChangeDetection(message:string){
    this.refreshTableSubject.next(message);
  }

  getTableUpdateListener(): Observable<string>{
    return this.refreshTableSubject.asObservable();
  }

  addToUpdatedMatches(_streamObj){
    this.streamDataUpdate.emit(_streamObj);
  }

  loadingMatches(isDone:boolean){
    this.loadPage.emit(isDone);
  }

  open2Ups(){
    this.viewSubscriptionsPage.emit(false);
    //Re-direct to football
    new Promise( (resolve,reject) => {
      //Re-direct to football
      setTimeout(()=>{
          this.router.navigate(['/matches']);
          resolve(true);
        }, 1000);
      });
  }

  openSubscriptions(){
    this.viewSubscriptionsPage.emit(true);
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

  openSABPopup(row:any, list:ActiveBet[]){

    const matDialogConfig: MatDialogConfig =  {
      width: '70%',
      height:  '80%',
      panelClass: 'view-active-bets-responsive',
      data: {row, list}
    }
    this.dialog.open(PopupViewSavedBetsComponent, matDialogConfig);
  }
}
