import { AfterViewInit, Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl,FormGroup,FormArray } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { JuicyMatch } from './juicy-match.model';
import { Subscription } from 'rxjs';
import { MatchStatsService } from '../services/match-stats.service';
import { MatchesService } from '../match/matches.service';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../services/user-properties.service';
import { TablePreferences } from '../user-properties.model';
import { MatchStatusService } from '../services/match-status.service';
import { DateHandlingService } from '../services/date-handling.service';
import { NotificationBoxService } from '../services/notification-box.service';
import { MatSort, Sort } from '@angular/material/sort';
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { ActiveBet } from '../models/active-bet.model';

@Component({
  selector: 'app-juicy-match',
  templateUrl: './juicy-match.component.html',
  styleUrls: ['./juicy-match.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})

export class JuicyMatchComponent implements OnChanges, OnInit, AfterViewInit {
  //Table properties
  @Input() allMatches: any;
  juicyMatches: JuicyMatch[];
  noMatchesToDisplay:boolean=true;
  //Used in DOM to select object view container for expansion
  expandedElement: JuicyMatch[] | null;
  displayedColumns: string[] = ['EpochTime', 'Fixture', 'Selection',  'BackOdds', 'LayOdds' , 'FTAround', 'EVthisBet', 'MatchRating', 'QLPercentage'];
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
  tableDateSelected: string;
  startDay: number;
  endDay: number
  allIndvMatches: any[];
  singleMatchPair: any;
  //Abandon hope all ye' who enter this rats nest.
  testBool:boolean;
  prefSub: Subscription;
  prefObj: TablePreferences;
  evFilterI: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilter: number;
  secretSauceFilter: number;
  isEvSelected: number;
  dataSource:any;
  formattedAmount:any;
  sortedData: Object[];
  @Input() selectionToIgnore: any[];
  @ViewChild(MatSort) sort: MatSort;

  columnHeaders: any[] = [
    { field: "EpochTime" , alias: "Event Start" },
    { field: "Fixture", alias: "Match" },
    { field: "Selection", alias: "Selection" },
    { field: "BackOdds", alias: "Back Odds" },
    { field: "LayOdds", alias: " Lay Odds" },
    { field: "FTAround", alias: "FTA" },
    { field: "EVthisBet", alias: "EV ($)" },
    { field: "MatchRating", alias: "Match Rating (%)" },
    { field: "QLPercentage", alias: "Secret Sauce (%)"},
  ];

  notificationSelectedSubscription: Subscription;
  watchedMatchesSubscription: Subscription;

  constructor(private savedActiveBetsService: SavedActiveBetsService, private chRef: ChangeDetectorRef, private sidenav: SidenavService, private juicyMHService: JuicyMatchHandlingService, private matchStatService: MatchStatsService, private matchesService: MatchesService, private userPrefService: UserPropertiesService, private matchStatusService: MatchStatusService, private dateHandlingService: DateHandlingService, private notificationServices: NotificationBoxService ) { }

  ngOnChanges(changes: SimpleChanges)
  {
    //Anytime there is a change to this list of matches, refresh list of single matches.
    if(changes.allMatches && changes.allMatches.currentValue) {

      if(this.allIndvMatches.length == 0){
        this.allIndvMatches = this.matchStatService.getSingleMatches(this.allMatches);
         console.log("Converting matches -> selections...");
         console.log(this.allIndvMatches);
         this.sortedData = this.allIndvMatches;
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
    this.isEvSelected = +this.prefObj.isEvSelected;
    this.allIndvMatches = [];
    this.tableDateSelected = this.userPrefService.getSelectedDate();
    this.getStartEndDays(this.userPrefService.getSelectedDate());

    // this.individualMatchesSub = this.juicyMHService.getJuicyUpdateListener().subscribe( (singleMatchData) => {
    //   this.allIndvMatches = singleMatchData;
    //   console.log("MHService");

    //   console.log(singleMatchData);

    // });

    this.dataSource = new FormArray(this.allIndvMatches.map( x => this.createForm(x)));
    //accesses an eventEmitter of streamData that is coming in via MongoDB ChangeStream.  Setsup a subscription to observable.
    this.streamSub = this.matchesService.streamDataUpdate
    .subscribe( (streamObj) => {
      console.log("Stream INCOMING!");
      //singleMatchPair is a freshly pushed Match object from our database. It is processed in retrieveStreamData.
      this.singleMatchPair = this.matchStatService.retrieveStreamData(streamObj);
      this.singleMatchPair.forEach( (streamObj) => {
        // find match and update the values with stream data coming from DB.
        var indexOfmatch = this.allIndvMatches.findIndex( indvMatch => indvMatch.Selection == streamObj.Selection );
         indexOfmatch != undefined && this.allIndvMatches[indexOfmatch] ? this.juicyMHService.updateSingleMatch(this.allIndvMatches[indexOfmatch], streamObj, indexOfmatch) : console.log("did not find singleMatch in indvMatch Array");
      });
    });


    this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe( date => {
      this.tableDateSelected = date;
      this.getStartEndDays(this.tableDateSelected);
      this.popJuiceInRange();
    });

    //set userPreference Values
    this.evFilterI = this.userPrefService.getEV();
    this.matchRatingFilter = this.userPrefService.getMR();
    this.minOddsFilter= this.userPrefService.getMinOdds();
    this.maxOddsFilter= this.userPrefService.getMaxOdds();

    //subscribe to userPreference Values
    this.prefSub = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.evFilterI = Number(tablePref.evFilterValueI);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilter= Number(tablePref.matchRatingFilterI);
      this.secretSauceFilter= Number(tablePref.secretSauceI);
      this.isEvSelected = +(tablePref.isEvSelected);
    });

    //Watchlist Subscription
    this.watchedMatchesSubscription = this.matchStatusService.getMatchWatchStatus().subscribe( matchObject => {
      //find selection and assign correct status to it.
      this.updateMatchWatchStatus(matchObject);
    });

    this.notificationSelectedSubscription = this.notificationServices.getNotificationPing().subscribe( notification => {
      this.openVIANotification(notification);
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
    // this.matchStatService.clear();
    this.dateSubscription.unsubscribe();
    this.notificationSelectedSubscription.unsubscribe();
  }

  //   //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
  //   //TODO Also, timestamp showing last update.
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    console.log(this.dataSource.sort);

    console.log("CHECK");

  }

  sortData(sort: Sort) {
    const data = this.allIndvMatches.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'EVthisBet': return compare(a['EVthisBet'], b['EVthisBet'], isAsc);
        case 'MatchRating': return compare(a['MatchRating'], b['MatchRating'], isAsc);
        case 'QLPercentage': return compare(a['QLPercentage'], b['QLPercentage'], isAsc);
        default: return 0;
      }
    });
  }

  createForm(data:any)
  {
    return new FormGroup(
      {
      Stake:new FormControl(data.Stake),
      LayStake:new FormControl(data.BackOdds / data.LayOdds * data.Stake),
      BackOdds:new FormControl(data.BackOdds),
      LayOdds:new FormControl(data.LayOdds),
      MatchInfo: new FormControl('Notes here'),
      });
  }

  onSubmit(){
    // console write new data.
  }

  getGroup(index:number)
  {
    // console.log("GETTING GROUP");

    //console.log(this.dataSource.at(index) as FormGroup);
    return this.dataSource.at(index) as FormGroup
  }

  private getStartEndDays(selectedDateStr: string) {
    var dateValidator = this.dateHandlingService.returnDateSelection(selectedDateStr);
    this.startDay = dateValidator[0];
    this.endDay = dateValidator[1];
  }

  LayStake(backOdds: number, layOdds:number, steakYum: number):number{
      var laySteak = (+backOdds / +layOdds)* +steakYum;
    return laySteak;
  }

  FTA(stake:number, backOdds: number, layOdds:number):number{
    var layStake = (+backOdds / +layOdds) * +stake;
    return (+stake * (+backOdds - 1) + +layStake);
  }

  TotalEV(occurence:number, stake:number, backOdds:number, layOdds:number):number{
    var layStake = (+backOdds / +layOdds) * +stake;
    var result:number = +(+stake * (+backOdds - 1) + +layStake)+ (+layStake- +stake)*(+occurence-1);
    return result;
  }

  NewMatchRating(backOdds:number, layOdds:number){
    return +(backOdds/layOdds)*100;
  }

  NewSS(backOdds:number,layOdds:number,stake:number){
    var fta = this.FTA(stake, backOdds, layOdds);
    var ql = this.QL(backOdds, layOdds, stake);
    var qlPercentage = +(ql/fta*100).toFixed(2);
    return qlPercentage;
  }

  ROI(stake:number, backOdds: number, layOdds:number, occurence:number):number{
    var layStake = (+backOdds / +layOdds) * +stake;
    var fullTurnAround = +stake * (+backOdds -1) + +layStake;
    var ql = +(+layStake- +stake);
    var evTotal = +(fullTurnAround + ( +ql * (+occurence -1)));
    var evThisBet = + (evTotal / occurence );

    return +((evThisBet/stake)*100);
  }

  QL(backOdds: number, layOdds:number, stake:number){
    var layStake = (+backOdds / +layOdds) * stake;
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

  //will have to be able to handle Watchlist Objects being passed to here?
  updateMatchWatchStatus(matchObject: any):void{
    this.allIndvMatches.filter( (individual)=> {
      if(individual.Selection == matchObject.Home || individual.Selection == matchObject.Away) individual.isWatched = matchObject.isWatched;
    });
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


  //Set visibility of selection. Based off selected date and current epoch time.
  dateInRange(selection: any){
    var epoch = this.dateHandlingService.returnSpecificNotificationBoundaries(this.tableDateSelected);
    if(this.tableDateSelected != undefined){
      ( selection.EpochTime*1000 > Date.now() && selection.EpochTime*1000 <= epoch.upperLimit ) ? selection.inRange = true : selection.inRange = false;
    }
   }

    showSelectionValues(selection: any, index: number){
      console.log(index);
      var data: FormGroup = this.getGroup(index);
      data.setValue({
        Stake: selection.Stake,
        LayStake: selection.LayStake,
        BackOdds: selection.BackOdds,
        LayOdds: selection.LayOdds,
        MatchInfo: 'Comments here',
      });
      //use a method to reset the formGroup values to selectionObject values.
    }

    openVIANotification(notification){
      var expandItem = this.allIndvMatches.filter( match =>{
        if(match.Selection == notification.matchObject.Selection && match.EventStart == notification.matchObject.EventStart) {
          match.isRedirected = 'Yes';
          var index = this.allIndvMatches.indexOf(match);
          this.loadGroup(index);
          this.showSelectionValues(match, index);
          return true;
        }
      });
      this.expandedElement = expandItem;
      this.chRef.detectChanges();
      console.log(expandItem);

    }

    closeIfRedirected(selection, event: Event){
      if(selection.isRedirected == 'Yes'){
        selection.isRedirected = 'No';

        console.log(event);

        event.stopPropagation();
      } else if (selection.isRedirected == 'No'){
        console.log("Doing Nothing On Click");

      }
    }

    saveAsActiveBet(row, index):void{
      /*Create json object with all properties you want to SAB as.

      Fixture
      Selection
      MatchDetail
      bookie stake
      bookie back odd
      exchange lay
      exchange lay odd
      Liability calc w above
      Total EV
      FTA
      QL
      ROI

      */


      var activeBetObject = this.returnActiveBetObject(row, index);
      this.savedActiveBetsService.saveToActiveBets(activeBetObject);
      row.activeBet = true;
      console.log("Stored data:");
      console.log(activeBetObject);

    }

    returnActiveBetObject(row,index): ActiveBet{

      var activeBetDetails = this.getGroup(index);
      var backOdd = activeBetDetails.value.BackOdds;
      var layOdd = activeBetDetails.value.LayOdds;
      var stake = activeBetDetails.value.Stake;
      var matchInfo = activeBetDetails.value.MatchInfo;
      console.log("Row Data");
      console.log(row.betState);

      console.log(row);


      var activeBet: ActiveBet = {
        created: Date.now(),
        fixture: row.Fixture,
        selection: row.Selection,
        logo: row.Selection.toLowerCase().split(' ').join('-'),
        matchDetail: row.EpochTime*1000,
        stake:  stake,
        backOdd: backOdd,
        layOdd: layOdd,
        layStake: +(backOdd/layOdd*stake).toFixed(2),
        liability: +((layOdd - 1) * +(backOdd/layOdd*stake)).toFixed(2),
        ev: +this.TotalEV(row.FTAround, stake, backOdd, layOdd).toFixed(2),
        mr: +this.NewMatchRating(backOdd, layOdd),
        sauce: +this.NewSS(backOdd, layOdd, stake),
        fta: +this.FTA(stake, backOdd, layOdd).toFixed(2),
        ql: +this.QL(backOdd, layOdd, stake).toFixed(2),
        roi: +this.ROI(stake, backOdd, layOdd, row.FTAround).toFixed(2),
        betState: row.betState,
        occ: row.FTAround,
        pl: +this.QL(backOdd, layOdd, stake).toFixed(2),
        comment: matchInfo,
        isSettled: false,
      }
      return activeBet;
    }

}
