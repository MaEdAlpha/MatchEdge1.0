import { Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { JuicyMatch } from './juicy-match.model';
import { Subscription } from 'rxjs';
import { MatchStatsService } from '../match-stats.service';
import { MatchesService } from '../match/matches.service';


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
  private streamSub: Subscription;
  allIndvMatches: any[];
  singleMatchPair: any;
  testBool:boolean;

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
    this.allIndvMatches = [];
    this.individualMatchesSub = this.juicyMHService.getJuicyUpdateListener().subscribe( (singleMatchData) => {
      this.allIndvMatches = singleMatchData;
    });

    //accesses an eventEmitter of streamData that is coming in via MongoDB ChangeStream.  Setsup a subscription to observable.
    this.streamSub = this.matchesService.streamDataUpdate
    .subscribe( (streamObj) => {
      //singleMatchPair is a freshly pushed Match object from our database. It is processed in retrieveStreamData.
      this.singleMatchPair = this.matchStatService.retrieveStreamData(streamObj);
      this.singleMatchPair.forEach( (match) => {
        // find match and update the values with stream data coming from DB.
        var indexOfmatch = this.allIndvMatches.findIndex( indvMatch => indvMatch.Selection == match.Selection );
        indexOfmatch != undefined && this.allIndvMatches[indexOfmatch] ? this.juicyMHService.updateSingleMatch(this.allIndvMatches[indexOfmatch], match, indexOfmatch) : console.log("did not find singleMatch in indvMatch Array");
      } );
    });
  }

  ngOnDestroy() {
    this.individualMatchesSub.unsubscribe();
    this.streamSub.unsubscribe();
    this.matchStatService.clear();
  }
  ngDoCheck(){
    // this.juicyMatches = this.juicyMHService.setJuicyMatches(this.allMatches);
  }
  //   //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
  //   //TODO Also, timestamp showing last update.

  hide(){
    this.isDisplayHidden = !this.isDisplayHidden;
  }

  resetMatchUpdated(index:number){
    //this.allIndvMatches[index].isUpdated=false;
  }
}