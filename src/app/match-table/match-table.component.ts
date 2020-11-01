import {Component, OnDestroy, OnInit, ViewChild, Directive, Output} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import {Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import {animate, state, style, transition, trigger} from '@angular/animations';



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
    expandedElement: any | null;
    retrieveMatches = false;
    tableCount: any;
    clicked: string[] = [];
    indexPositions: number[];
    @Output() activeMatches: Match[] = [];

    private matchesSub: Subscription;
    private matchesCountSub: Subscription;

    @ViewChild(MatTable) table: MatTable<any>;


    constructor(public matchesService: MatchesService) { } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

     ngOnInit() {
       this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
       this.matchesSub = this.matchesService.getMatchUpdateListener()
       .subscribe((matchData: any)=>{
         this.matches = matchData;
        });
        this.tableCount = this.matchesService.getTableCount();
        this.matchesCountSub = this.matchesService.getMatchCountListener()
        .subscribe((matchCount: any) => {
          this.tableCount = matchCount;

          this.initWatchButtons(this.tableCount);
        })

     }

     ngOnDestroy(){
       this.matchesSub.unsubscribe();
       this.matchesCountSub.unsubscribe();
       console.log("Destroyed");
     }

     initWatchButtons(count: number){
        for(var i=0; i<count; i++)
        {
          this.clicked.push('false');
        }
     }
    addColumn(){
      const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
      this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
    }

    clearMatches() {
      this.matches = this.data;
    }

    getMatches() {
      this.matches = this.matchesService.getMatches();
      this.table.renderRows();
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
  }



















// import { Component } from '@angular/core';

// export interface PeriodicElement {
//   date: string;
//   time: string;
//   home: string;
//   homeTwoUp: number;
//   homeBackOdds: number;
//   homeLayOdds: number;
//   away: string;
//   awayTwoUp: number;
//   awayBackOdds: number;
//   awayLayOdds: number;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
// ];

// @Component({
//   selector: 'app-match-table',
//   templateUrl: './match-table.component.html',
//   styleUrls: ['./match-table.component.css']
// })
// export class MatchTableComponent {
//   displayedColumns: string[] = [ 'date', 'time', 'Home', '2UpFTAOcc.', 'BackOdds', 'LayOdds', 'MatchRating', 'Return%', 'Away', '2UpFTAOcc.', 'BackOdds', 'LayOdds', 'MatchRating', 'Return'];
//   columnsToDisplay: string[] = this.displayedColumns.slice();
//   data: PeriodicElement[] = ELEMENT_DATA;


//   addColumn() {
//     const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
//     this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
//   }

//   removeColumn() {
//     if (this.columnsToDisplay.length) {
//       this.columnsToDisplay.pop();
//     }
//   }

//   shuffle() {
//     let currentIndex = this.columnsToDisplay.length;
//     while (0 !== currentIndex) {
//       let randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex -= 1;

//       // Swap
//       let temp = this.columnsToDisplay[currentIndex];
//       this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
//       this.columnsToDisplay[randomIndex] = temp;
//     }
//   }
// }
