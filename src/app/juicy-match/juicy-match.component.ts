import { Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { JuicyMatch } from './juicy-match.model';
import { Subscription } from 'rxjs';
import { MatchStatsService } from '../match-stats.service';
import { MatchesService } from '../match/matches.service';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../user-properties.service';
import { TablePreferences } from '../user-properties.model';


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
  noMatchesToDisplay:boolean=true;
  //Used in DOM to select object view container for expansion
  expandedElement: JuicyMatch[] | null;
  displayedColumns: string[] = ['EventStart', 'Fixture', 'Selection',  'BackOdds', 'LayOdds' , 'EVthisBet', 'MatchRating'];
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
  prefSub: Subscription;
  prefObj: TablePreferences;
  evFilter: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilter: number;
  isEvSelected: boolean;

  constructor(private sidenav: SidenavService, private juicyMHService: JuicyMatchHandlingService, private matchStatService: MatchStatsService, private matchesService: MatchesService, private userPrefService: UserPropertiesService ) { }

  ngOnChanges(changes: SimpleChanges)
  {
    //Anytime there is a change to this list of matches, refresh list of single matches.
    if(changes.allMatches && changes.allMatches.currentValue) {
      this.allIndvMatches = this.juicyMHService.getSingleMatches(this.allMatches);
      console.log("Change Detection Activated");
      this.allIndvMatches.length === 0 ? this.noMatchesToDisplay = true : this.noMatchesToDisplay = false;

    }
  }

  ngOnInit(){
    this.prefObj = this.userPrefService.getTablePrefs();
    this.isEvSelected = Boolean(this.prefObj.isEvSelected);
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
    //set userPreference Values
    this.evFilter = this.userPrefService.getEV();
    this.matchRatingFilter = this.userPrefService.getMR();
    this.minOddsFilter= this.userPrefService.getMinOdds();
    this.maxOddsFilter= this.userPrefService.getMaxOdds();

    //subscribe to userPreference Values
    this.prefSub = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.evFilter = Number(tablePref.evFilterValue);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilter= Number(tablePref.maxRatingFilter);
      this.isEvSelected = Boolean(tablePref.isEvSelected);
    });
  }

  ngOnDestroy() {
    this.individualMatchesSub.unsubscribe();
    this.streamSub.unsubscribe();
    this.matchStatService.clear();
  }
  ngDoCheck(){
  }
  //   //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
  //   //TODO Also, timestamp showing last update.

  hide(){
    this.isDisplayHidden = !this.isDisplayHidden;
  }

  toggleSideNav(){
    this.sidenav.toggle();
  }
}
