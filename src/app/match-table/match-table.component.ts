import {Component, OnDestroy, OnInit, ViewChild, Directive, Output, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { interval } from 'rxjs';
import { Observable } from 'rxjs';
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
    data: Match[] = [];
    matches: any;
    matchStream: any;
    expandedElement: any | null;
    retrieveMatches = false;
    tableCount: any;
    clicked: string[] = [];
    indexPositions: number[];
    @Output() activeMatches: Match[] = [];

    private matchesSub: Subscription;
    private matchesCountSub: Subscription;

    @ViewChild(MatTable) table: MatTable<Match>;


    constructor(public matchesService: MatchesService, public webSocketService: WebsocketService ) { } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

     ngOnInit() {


       this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
       this.matchesSub = this.matchesService.getMatchUpdateListener()
       .subscribe((matchData: Match)=>{
         this.matches = matchData;
        });

        this.tableCount = this.matchesService.getTableCount();
        this.matchesCountSub = this.matchesService.getMatchCountListener()
        .subscribe((matchCount: number) => {
          this.tableCount = matchCount;

          this.initWatchButtons(this.tableCount);
        });

        this.webSocketService.openWebSocket();
        this.matchStream = this.webSocketService.updateStreamData();

        //Start parsing matchstream with matches?


        interval(10000).subscribe(() => {
          this.method();
           });
     }

     ngOnDestroy(){
       this.matchesSub.unsubscribe();
       this.matchesCountSub.unsubscribe();
       console.log("Destroyed");
       this.webSocketService.closeWebSocket();
     }

     initWatchButtons(count: number){
        for(var i=0; i<count; i++)
        {
          this.clicked.push('false');
        }
     }

     method() {
      this.matchStream.forEach( streamMatch => {

         this.matches.forEach( match => {
           var matchId = match.Home + " " + match.Away + " " + match.Details;
           if(matchId == streamMatch._id){
              console.log("MATCH!!!   " + matchId + " " + streamMatch._id);
              match.Home = "UPDATED!";
              match.Away = "DYNAMITE!";
           }

          })
        })
     }

    clearMatches() {
      this.matches = this.data;
    }

    getMatches() {
      this.matches = this.matchesService.getMatches();
      //this.table.renderRows();
    }

    addToActiveList(match: any) {
      this.activeMatches.push(match);
      console.log("Added " + match.Home)
      //method that hides this object
     // console.log(this.matches[0].Home);
    }

    enableMatchButton(match: any)
    {
      for(var i=0; i < this.matches.length; i++){
        if( match.Home === this.matches[i].Home && match.Away === this.matches[i].Away){
          console.log("Changing button " + i);
          this.clicked[i] = 'false';
        }
      }
    }

    disableButton(index:any)
    {
      this.clicked[index]='true';
    }
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
