import { Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { IsJuicyService } from './is-juicy.service';
import { JuicyMatch } from './juicy-match.model';
import { Subscription, Observable, from } from 'rxjs';
import { MatchStatsService } from '../match-stats.service';
import { MatchesService } from '../match/matches.service';
import { Match } from '../match/match.model';

@Component({
  selector: 'app-juicy-match',
  templateUrl: './juicy-match.component.html',
  styleUrls: ['./juicy-match.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class JuicyMatchComponent implements OnChanges, DoCheck {
  //Table properties
  @Input() allMatches: any;
  juicyMatches: JuicyMatch[];
  matchesToDisplay:boolean=true;
  expandedElement: JuicyMatch[] | null;
  displayedColumns: string[] = ['EventStart', 'Fixture', 'Selection',  'BackOdds', 'LayOdds' , 'EVthisBet'];
  SecondcolumnsToDisplay: string[] = ['Logo', 'FTAround', 'ReturnRating', 'MatchRating', 'BackOdds', 'LayOdds', 'Liability', 'FTAProfit', 'QL', 'ROI', 'EVthisBet'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  //Tooltip properties
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);

  //Icon properties
  isDisplayHidden: boolean = true;

  private individualMatchesSub: Subscription;
  allIndvMatches: any[];
  singleMatchPair: any;

  constructor(private juicyMHService: JuicyMatchHandlingService, private matchStatService: MatchStatsService, private matchesService: MatchesService ) { }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.allMatches && changes.allMatches.currentValue) {
      //this.juicyMatches = this.juicyMHService.setJuicyMatches(this.allMatches);
      this.allIndvMatches = this.juicyMHService.getSingleMatches(this.allMatches);
      console.log("JM Comp: SimpleChanges");
      this.allIndvMatches.length === 0 ? this.matchesToDisplay=true : this.matchesToDisplay=false;
    }
  }

  ngOnInit(){
    console.log("ngOninit JC Comp");

    this.individualMatchesSub = this.juicyMHService.getJuicyUpdateListener().subscribe( (singleMatchData) => {
      this.allIndvMatches = singleMatchData;
    });

    this.matchesService.streamDataUpdate
    .subscribe( (streamObj) => {
      this.singleMatchPair = this.matchStatService.retrieveStreamData(streamObj);
      this.singleMatchPair.forEach( (match) => {
        // find each match and update the values
        var indexOfmatch = this.allIndvMatches.findIndex( indvMatch => indvMatch.Selection == match.Selection );
        indexOfmatch != undefined && this.allIndvMatches[indexOfmatch] ? this.updateSingleMatch(this.allIndvMatches[indexOfmatch], match) : console.log("did not find singleMatch in indvMatch Array");

        console.log("JCComp: streammDataUpdate: " + match.Selection);

        //run the whole array through your EVthisBet range
      } );


    });
    //subscribe to emitter of streamChange Data. Use this fkor your single Matches parse.
  }

// AwayTeamName: "Birmingham City"
// B365AwayOdds: 4.2
// B365BTTSOdds: 1.83
// B365DrawOdds: 3.5
// B365HomeOdds: 4.7
// B365O25GoalsOdds: 2.3
// HomeTeamName: "Luton Town"
// League: "England Championship"
// OccurrenceAway: 69
// OccurrenceHome: 49
// SmarketsAwayOdds: "2.86"
// SmarketsHomeOdds: "3"
// StartDateTime: "24-11-2020 19:00:00"

  ngOnDestroy() {
    this.individualMatchesSub.unsubscribe();
  }
  ngDoCheck(){
    // this.juicyMatches = this.juicyMHService.setJuicyMatches(this.allMatches);
  }

  updateSingleMatch(mainMatch, streamChangeMatch){
    //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
    //TODO Also, timestamp showing last update.
    mainMatch.Stake = streamChangeMatch.Stake;
    mainMatch.LayStake = streamChangeMatch.LayStake;
    mainMatch.BackOdds = streamChangeMatch.BackOdds;
    mainMatch.LayOdds = streamChangeMatch.LayOdds;
    mainMatch.FTAround = streamChangeMatch.FTAround;
    mainMatch.FTAProfit = streamChangeMatch.FTAProfit;
    mainMatch.EVTotal = streamChangeMatch.EVTotal;
    mainMatch.EVthisBet = streamChangeMatch.EVthisBet;
    mainMatch.ReturnRating = streamChangeMatch.ReturnRating;
    mainMatch.MatchRating = streamChangeMatch.MatchRating;
    mainMatch.Liability = streamChangeMatch.Liability;
    mainMatch.QL = streamChangeMatch.QL;
    mainMatch.ROI = streamChangeMatch.ROI;
  }

  hide(){
    this.isDisplayHidden = !this.isDisplayHidden;
  }
}
