import {Component, OnDestroy, OnInit, ViewChild, Output, EventEmitter, Input , OnChanges, DoCheck, SimpleChanges} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { interval } from 'rxjs';
import { WebsocketService } from '../websocket.service';
import { SidenavService } from '../view-table-sidenav/sidenav.service';

  @Component({
    selector: 'app-match-table',
    templateUrl: './match-table.component.html',
    styleUrls: ['./match-table.component.css'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
  })

  export class MatchTableComponent implements OnInit, OnChanges, OnDestroy {

    displayedColumns: string[] = ['AReturn','SMHome','BHome', 'OccH', 'Home',  'Details', 'Away', 'OccA' , 'BAway','SMAway', 'HReturn'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    @Input() matches: any;
    matchStream: any;
    expandedElement: any | null;
    retrieveMatches = false;
    tableCount: any;
    matchWatched: string[] = [];
    indexPositions: number[];
    displayHidden: boolean = true;

    isNotInList: boolean = false;

    @ViewChild(MatTable) table: MatTable<any>;


    private matchesSub: Subscription;


    constructor(private sidenav: SidenavService, private matchesService: MatchesService, private webSocketService: WebsocketService ) { } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

      ngOnChanges(changes: SimpleChanges){
        if(changes.matches && changes.matches.currentValue) {

        }
      }

      ngOnInit() {
        this.matches = this.matchesService.getMatches(); //fetches matches from matchesService

        this.matchesSub = this.matchesService.getMatchUpdateListener() //subscribe to matches for any changes.
        .subscribe((matchData: any) => {
          //Assign each matchData subscribed to the list of objects you inject into html
         this.matches = matchData;
        });

        //Open Socket Connection
        this.webSocketService.openWebSocket();
        //Subscribe to Event listener in matches Service for StreamChange data. Update this.matches.
        this.matchesService.streamDataUpdate
        .subscribe( (streamObj) => {
          console.log("recieved in MT comp streamUpdate subscrb");

          var indexOfmatch = this.matches.findIndex( match => match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName);
          indexOfmatch != undefined && this.matches[indexOfmatch] ? this.updateMatch(this.matches[indexOfmatch], streamObj) : console.log("not found");
        });
      }

      ngOnDestroy(){
       this.matchesSub.unsubscribe();
       this.webSocketService.closeWebSocket();
      }

      initWatchButtons(count: number){
        for(var i=0; i<count; i++)
        {
          this.matchWatched.push('false');
        }
      }

      toggleSideNav(){
        this.sidenav.toggle();
      }

      watchForMatchUpdates() {
       this.matchStream.forEach(streamMatch => {
          this.matches.forEach( (match) => {
            //created id value
            var matchId = match.Home + " " + match.Away + " " + match.Details;
             if(matchId == streamMatch._id){
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
                  match.OccH = streamMatch.OccurenceHome;
                  match.OccA = streamMatch.OccurrenceAway;
                  console.log("In BTTS area " + typeof streamMatch.OccurrenceAway);
                }
                if(matchId !== streamMatch._id)
                {
                  this.isNotInList = true;
                }
              } else {
              }
          })

          if(this.isNotInList || this.matches.length == 0)
          {
            console.log("not in list");
            console.log(streamMatch);
            this.isNotInList=false;
          }
        })
      }

    enableMatchButton(match: any)
    {
      for(var i=0; i < this.matches.length; i++){
        if( match.Home === this.matches[i].Home && match.Away === this.matches[i].Away){
          this.matchWatched[i] = 'false';
          console.log("Testing index call " + this.matches.findIndex(match))
        }
      }
    }

    disableButton(index:any)
    {
      this.matchWatched[index]='true';
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
    }

    watchStatus(status: boolean){
      status = !status;
      console.log(status);
      //Send to service to notificationServices.
      //pass the object forward to a notification list. which will then do the thing
      //i.e directive attributes for styling
      //actvate notifications
    }

    betStatus(status: boolean){
      status = !status;
      console.log(status);
    }

    ignoreStatus(status: boolean){
      status = !status;
      console.log(status);

    }
  }

