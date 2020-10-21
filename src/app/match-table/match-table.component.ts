import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import {Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';



  @Component({
    selector: 'app-match-table',
    templateUrl: './match-table.component.html',
    styleUrls: ['./match-table.component.css']
  })

  export class MatchTableComponent implements OnInit, OnDestroy {

    displayedColumns: string[] = [ 'StartDateTime', 'HomeTeamName', 'SmarketsHomeOdds','B365HomeOdds', 'B365DrawOdds', 'B365AwayOdds', 'B365BTTSOdds', 'B365O25GoalsOdds', 'AwayTeamName' ,'SmarketsAwayOdds',  'League', 'OccurrenceHome', 'OccurrenceAway'];

    columnsToDisplay: string[] = this.displayedColumns.slice();
    data: Match[] = [];
    matches: any = [];
    private matchesSub: Subscription;
    retrieveMatches = false;

    @ViewChild(MatTable) table: MatTable<any>;


    constructor(public matchesService: MatchesService) { } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

     ngOnInit() {
       this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
       this.matchesSub = this.matchesService.getMatchUpdateListener()
       .subscribe((matchData: any)=>{
         this.matches = matchData;
       });
     }

     ngOnDestroy(){
       this.matchesSub.unsubscribe();
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
