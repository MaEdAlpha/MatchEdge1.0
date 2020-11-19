import {Component, OnDestroy, OnInit, ViewChild, Directive, Output, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { interval } from 'rxjs';
import { WebsocketService } from '../websocket.service';

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

  export class MatchTableComponent implements OnInit, OnDestroy {

    displayedColumns: string[] = ['AReturn', 'Home', 'Spacer',  'Details', 'Away' , 'HReturn'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    matches: any;
    matchStream: any;
    expandedElement: any | null;
    retrieveMatches = false;
    tableCount: any;
    matchWatched: string[] = [];
    indexPositions: number[];
    //For ticker Directives

    @Output() activeMatches: Match[] = [];
    @Output() watchEvent = new EventEmitter<number>();

    private matchesSub: Subscription;

    @ViewChild(MatTable) table: MatTable<Match>;


    constructor(public matchesService: MatchesService, public webSocketService: WebsocketService ) { } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

     ngOnInit() {
       this.matches = this.matchesService.getMatches(); //fetches matches from matchesService

       this.matchesSub = this.matchesService.getMatchUpdateListener()
       .subscribe((matchData: Match)=>{
         this.matches = matchData;
        });

        this.tableCount = this.matchesService.getTableCount();

        this.activeMatches = this.matches;

        this.webSocketService.openWebSocket();
        this.matchStream = this.webSocketService.updateStreamData();

        //Start parsing matchstream with matches?
        interval(1000).subscribe(() => {
          this.watchForMatchUpdates();
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

     watchForMatchUpdates() {
      this.matchStream.forEach( streamMatch => {
          this.matches.forEach( (match, index) => {
            //created id value
            var matchId = match.Home + " " + match.Away + " " + match.Details;
             if(matchId == streamMatch._id){
                //console.log("Match update found: " + matchId + " PrevSMH/A: " + match.SMHome + " " + match.SMAway + "  New: " + streamMatch.SmarketsHomeOdds + " " + streamMatch.SmarketsAwayOdds);
                match.SMHome = streamMatch.SmarketsHomeOdds;
                match.SMAway = streamMatch.SmarketsAwayOdds;
                //emit the index of this matches element to change the color of the values. for the odds flicker
                // styleHook(index); <== pass index of array to activate oddsChangeNotification
            } else {
                //Do nothing
            }
          })
      })
     }

     getMatches() {
      this.matches = this.matchesService.getMatches();
      //this.table.renderRows();
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

    //TODO make the auto match compile to arrange matches based off 'x' indicator
    shuffle() {
      let currentIndex = this.columnsToDisplay.length;

      while (0 !== currentIndex) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // Swap
        let temp = this.columnsToDisplay[currentIndex];
        this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
        this.columnsToDisplay[randomIndex] = temp;
      }
    }

    socketAccess() {
      this.matchStream = this.webSocketService.updateStreamData();
    }
  }


  // WebSocket output is JSON with following paramaters.
  // {
  //   "_id":"Burnley Crystal Palace 21-11-2020 15:00:00",
  //   "HomeTeamName":"Burnley",
  //   "AwayTeamName":"Crystal Palace",
  //   "SmarketsHomeOdds":" ",
  //   "SmarketsAwayOdds":" ",
  //   "B365HomeOdds":0,
  //   "B365DrawOdds":0,
  //   "B365AwayOdds":0,
  //   "B365BTTSOdds":0,
  //   "B365O25GoalsOdds":0,
  //   "StartDateTime":"21-11-2020 15:00:00",
  //   "League":null,
  //   "OccurrenceHome":0,
  //   "OccurrenceAway":0
  // }
