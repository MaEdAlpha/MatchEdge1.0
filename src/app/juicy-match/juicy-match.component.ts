import { Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl,FormGroup,FormArray } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { JuicyMatch } from './juicy-match.model';
import { Subscription } from 'rxjs';
import { MatchStatsService } from '../match-stats.service';
import { MatchesService } from '../match/matches.service';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../user-properties.service';
import { TablePreferences } from '../user-properties.model';
import { MatchStatusService } from '../match-status.service';
import { DateHandlingService } from '../date-handling.service';




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

export class JuicyMatchComponent implements OnChanges, OnInit {
  //Table properties
  @Input() allMatches: any;
  juicyMatches: JuicyMatch[];
  noMatchesToDisplay:boolean=true;
  //Used in DOM to select object view container for expansion
  expandedElement: JuicyMatch[] | null;
  displayedColumns: string[] = ['EventStart', 'Fixture', 'Selection',  'BackOdds', 'LayOdds' , 'FTAround', 'EVthisBet', 'MatchRating'];
  SecondcolumnsToDisplay: string[] = ['Logo', 'FTAround', 'ReturnRating', 'MatchRating', 'BackOdds', 'LayOdds', 'Liability', 'FTAProfit', 'QL', 'ROI', 'EVthisBet'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  //Tooltip properties
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  selectionValues: FormGroup;
  //Icon properties
  isDisplayHidden: boolean = true;
  private individualMatchesSub: Subscription;
  private streamSub: Subscription;
  private dateSubscription: Subscription;
  startDay: number;
  endDay: number
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
  dataSource:any;
  formattedAmount:any;
  @Input() selectionToIgnore: any[];

  constructor(private sidenav: SidenavService, private juicyMHService: JuicyMatchHandlingService, private matchStatService: MatchStatsService, private matchesService: MatchesService, private userPrefService: UserPropertiesService, private matchStatusService: MatchStatusService, private dateHandlingService: DateHandlingService ) { }

  ngOnChanges(changes: SimpleChanges)
  {
    //Anytime there is a change to this list of matches, refresh list of single matches.
    if(changes.allMatches && changes.allMatches.currentValue) {

      if(this.allIndvMatches.length == 0){
        this.allIndvMatches = this.juicyMHService.getSingleMatches(this.allMatches);
         console.log("Converting matches -> selections...");
         console.log(this.allIndvMatches);
        if(this.allIndvMatches != undefined){
          console.log("Creating new formArray");
          this.dataSource = new FormArray(this.allIndvMatches.map( x=> this.createForm(x)));
          //is what lets HTML see which matches to display. without this, you need to trigger date change in toplayer filter to initalize match load.
          this.popJuiceInRange();
        }
      }
      this.allIndvMatches.length === 0 ? this.noMatchesToDisplay = true : this.noMatchesToDisplay = false;
    }

    if(changes.selectionToIgnore && changes.selectionToIgnore.currentValue && this.selectionToIgnore != undefined) {
           this.updateIgnoreStatus(this.selectionToIgnore);
           console.log("Ignore These Selections Below: ");
           console.log(this.selectionToIgnore);
    }
  }


  ngOnInit(){
    //Get initial user settings on initialization. For this to work, need to use HTTP Get request of userPreferences at page load.
    this.prefObj = this.userPrefService.getTablePrefs();
    this.isEvSelected = Boolean(this.prefObj.isEvSelected);
    this.allIndvMatches = [];
    this.getStartEndDays(this.userPrefService.getSelectedDate());

    this.individualMatchesSub = this.juicyMHService.getJuicyUpdateListener().subscribe( (singleMatchData) => {
      this.allIndvMatches = singleMatchData;
    });

    this.dataSource = new FormArray(this.allIndvMatches.map( x=> this.createForm(x)));
    //accesses an eventEmitter of streamData that is coming in via MongoDB ChangeStream.  Setsup a subscription to observable.
    this.streamSub = this.matchesService.streamDataUpdate
    .subscribe( (streamObj) => {
      //singleMatchPair is a freshly pushed Match object from our database. It is processed in retrieveStreamData.
      this.singleMatchPair = this.matchStatService.retrieveStreamData(streamObj);
      this.singleMatchPair.forEach( (streamObj) => {
        // find match and update the values with stream data coming from DB.
        var indexOfmatch = this.allIndvMatches.findIndex( indvMatch => indvMatch.Selection == streamObj.Selection );
        indexOfmatch != undefined && this.allIndvMatches[indexOfmatch] ? this.juicyMHService.updateSingleMatch(this.allIndvMatches[indexOfmatch], streamObj, indexOfmatch) : console.log("did not find singleMatch in indvMatch Array");
      });
    });


    this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe(date => {
      this.getStartEndDays(date);
      this.popJuiceInRange();
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


  //Populates matches in date range. Need this for refreshing new matches under date criteria.
  private popJuiceInRange() {
    this.allIndvMatches.forEach(selection => {
      this.dateInRange(selection);
    });
  }

  ngOnDestroy() {
    this.individualMatchesSub.unsubscribe();
    this.streamSub.unsubscribe();
    this.matchStatService.clear();
    this.dateSubscription.unsubscribe();
  }

  //   //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
  //   //TODO Also, timestamp showing last update.

  createForm(data:any)
  {
    return new FormGroup(
      {
      Stake:new FormControl(data.Stake),
      LayStake:new FormControl(data.LayStake),
      BackOdds:new FormControl(data.BackOdds),
      LayOdds:new FormControl(data.LayOdds),
      });
  }

  onSubmit(){
    // console write new data.
  }

  getGroup(index:number)
  {
    // console.log("GETTING GROUP");

    // console.log(this.dataSource.at(index));
    return this.dataSource.at(index) as FormGroup
  }

  private getStartEndDays(selectedDateStr: string) {
    var dateValidator = this.dateHandlingService.returnDateSelection(selectedDateStr);
    this.startDay = dateValidator[0];
    this.endDay = dateValidator[1];
  }

  LayOdds(backOdds: number, layOdds:number, steakYum: number):number{
      var laySteak = (+backOdds/ +layOdds)* +steakYum;

    return laySteak;
  }

  FTA(stake:number, backOdds: number, layStake: number):number{
    return (+stake*(+backOdds - 1)+ +layStake);
  }

  TotalEV(occurence:number, stake:number, backOdds:number, layStake:number ):number{
   var result:number = +(+stake * (+backOdds - 1) + +layStake)+ (+layStake- +stake)*(+occurence-1);
   return result;
  }

  ROI(stake:number, evThisBet:number):number{
    return +((evThisBet/stake)*100);
  }

  QL(layStake:number, stake:number){
    return +(+layStake - +stake);
  }

  Liability(layOdds:number, layStake:number):number {
    return +(+layOdds - 1 )* +layStake;
  }
  hide(){
    this.isDisplayHidden = !this.isDisplayHidden;
  }

  toggleSideNav(){
    this.sidenav.toggle();
  }
  loadGroup(i:number){
    this.selectionValues = this.getGroup(i);
  }

  freezeAllMotorFunctions(){

  }

  updateIgnoreStatus(ignoreSelection: any[]){
    if(ignoreSelection.length == 2 ){
      this.allIndvMatches.forEach( selection => {
        if(selection.Selection == ignoreSelection[0])
        {
          selection.ignore = ignoreSelection[1];
          console.log(selection.Selection + " : ignore = " + ignoreSelection[1]);
        }
      });
    } else if (ignoreSelection[0] == true || ignoreSelection[0] == false){
        var status: boolean = ignoreSelection[0];
        ignoreSelection.forEach( selection => {
          this.allIndvMatches.forEach( juicySelection => {
           if(juicySelection.Selection == selection) {
             juicySelection.ignore = status;
            }
          });
       });
    }
  }



  dateInRange(selection: any){

    var matchDay = this.dateHandlingService.convertGBStringDate(selection.EventStart).getDate();

    if( matchDay == this.startDay || matchDay == this.endDay) {
      selection.inRange=true;

    } else {
      selection.inRange=false;

    }
   }

    show(selection: any, index: number){
      var data: FormGroup = this.getGroup(index);
      data.setValue({
        Stake: selection.Stake,
        LayStake: selection.LayStake,
        BackOdds: selection.BackOdds,
        LayOdds: selection.LayOdds,
      });
      //use a method to reset the formGroup values to selectionObject values.
    }
}
