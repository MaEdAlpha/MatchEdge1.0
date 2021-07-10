import { AfterViewInit, Component, Input, OnInit, OnDestroy, DoCheck, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { FormControl,FormGroup,FormArray } from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { JuicyMatch } from './juicy-match.model';
import { BehaviorSubject, Subscription } from 'rxjs';
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
                              transition('expanded <=> collapsed', animate('320ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
                              transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
                            ]
    ),
  ],
})

export class JuicyMatchComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  //Table properties
  @Input() allMatches: any;
  @Input()  ftaOption: string;
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
  private dateSubscription: Subscription;
  private streamSub: Subscription;
  private notifySubscription: Subscription;
  private clearJuicySubscription: Subscription;
  tableDateSelected: string;
  startDay: number;
  endDay: number
  allIndvMatches: JuicyMatch[];
  juicyMatchStreamUpdate: JuicyMatch;
  //Abandon hope all ye' who enter this rats nest.
  testBool:boolean;
  prefSub: Subscription;
  prefObj: TablePreferences;
  userCommission: number;
  evFilterI: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilter: number;
  secretSauceFilter: number;
  fvSelected: number;
  dataSource:any;
  formattedAmount:any;
  sortedData: JuicyMatch[];
  @Input() selectionToIgnore: any[];
  @ViewChild(MatSort) sort: MatSort;
  tableSubject: BehaviorSubject<JuicyMatch[]>;

  columnHeaders: any[] = [
    { field: "EpochTime" , alias: "" },
    { field: "Fixture", alias: "Match" },
    { field: "Selection", alias: "Selection" },
    { field: "BackOdds", alias: "Back Odds" },
    { field: "LayOdds", alias: " Lay Odds" },
    { field: "FTAround", alias: "FTA" },
    { field: "EVthisBet", alias: "EV (£)" },
    { field: "MatchRating", alias: "MR (%)" },
    { field: "QLPercentage", alias: "QL (%)"},
  ];

  notificationSelectedSubscription: Subscription;
  watchedMatchesSubscription: Subscription;

  constructor(private savedActiveBetsService: SavedActiveBetsService,
              private chRef: ChangeDetectorRef,
              private sidenav: SidenavService,
              private juicyMHService: JuicyMatchHandlingService,
              private matchStatService: MatchStatsService,
              private matchesService: MatchesService,
              private userPrefService: UserPropertiesService,
              private matchStatusService: MatchStatusService,
              private dateHandlingService: DateHandlingService,
              private notificationServices: NotificationBoxService,
              ) {}

  ngOnChanges(changes: SimpleChanges)
  {
    //Anytime there is a change to this list of matches, refresh list of single matches.
    if(changes.allMatches && changes.allMatches.currentValue) {

      if(this.allIndvMatches.length == 0){
        //Creates juicyMatch object with calculated stats.
        console.log("DOING THE THING");

        this.ftaOption = this.userPrefService.getFTAOption();
        this.allIndvMatches = this.matchStatService.getSelectionStatCalcs(this.allMatches, this.ftaOption);
        this.sortedData = this.allIndvMatches;


        //Create table of Juicy Matches once allIndvMatches is no longer undefined.
        if(this.allIndvMatches != undefined){
          console.log("----Creating a form Array \n Checking selections in range");
          this.dataSource = new FormArray(this.allIndvMatches.map( x=> this.createForm(x) ) );
          this.sortedData = this.allIndvMatches;
          this.popJuiceInRange();
          //call match-Status service to trigger localStorage initialization.
          this.matchStatusService.individualMatchesFinishedLoading(true);
        }
      }
    }

    if(changes.ftaOption && changes.ftaOption != undefined && this.allIndvMatches != undefined){
      console.log("--------------------TRIGGERED on ftaOption Change----------------");
      let updatedArray: JuicyMatch[] = this.matchStatService.recalculateStatCalcs(this.sortedData, this.ftaOption);
      this.sortedData = updatedArray;
      this.popJuiceInRange();
    }
  }

  ngOnInit(){
    //Get initial user settings on initialization. For this to work, need to use HTTP Get request of userPreferences at page load.
    this.prefObj = this.userPrefService.getTablePrefs();
    this.ftaOption = this.userPrefService.getFTAOption();
    this.noMatchesToDisplay = true;
    console.log(this.ftaOption);

    console.log("User settings.filters from UserPref Services. ");
    console.log(this.prefObj);

    this.userCommission= this.userPrefService.getCommission();


    this.fvSelected = +this.prefObj.fvSelected;
    console.log("Juicy Table Filter selection: " + this.fvSelected);

    this.allIndvMatches = [];
    this.tableDateSelected = this.userPrefService.getSelectedDate();
    this.getStartEndDays(this.userPrefService.getSelectedDate());

    this.dataSource = new FormArray(this.allIndvMatches.map( x => this.createForm(x)));
    //accesses an eventEmitter of streamData that is coming in via MongoDB ChangeStream.  Setsup a subscription to observable.
    this.streamSub = this.matchesService.streamDataUpdate.subscribe( (streamObj) => {
      console.log(streamObj);

      console.log("Stream INCOMING! Sorted Data below");
      console.log(this.sortedData);

      var lookupIndex: number[] = []

      lookupIndex.push( this.sortedData.findIndex( (indvMatch) => indvMatch.Selection == streamObj.HomeTeamName && indvMatch.EpochTime == streamObj.unixDateTimestamp) );
      lookupIndex.push( this.sortedData.findIndex( (indvMatch) => indvMatch.Selection == streamObj.AwayTeamName && indvMatch.EpochTime == streamObj.unixDateTimestamp) );
      console.log(lookupIndex);

      lookupIndex.forEach( indexOfmatch => {
        var juicyMatchBase = this.sortedData[indexOfmatch];

        console.log('-------------PASSING IN TO COMPARE STREAM DATA--------');
        //sets wolverhapmton to false.....
        var resultII = juicyMatchBase.notify;
        console.log(resultII);
        var result = this.sortedData[indexOfmatch].notify;
        console.log(result);
        console.log('----------------------------------------------------------');

        //singleMatchPair is a freshly pushed Match object from our database. It is processed in retrieveStreamData.
        this.juicyMatchStreamUpdate =  (indexOfmatch != undefined && this.sortedData[indexOfmatch]) ? this.matchStatService.retrieveStreamData(streamObj, juicyMatchBase.Selection ) : null;
        (indexOfmatch != undefined && this.sortedData[indexOfmatch]) ? this.juicyMHService.updateSingleMatch( juicyMatchBase, this.juicyMatchStreamUpdate, indexOfmatch) : console.log("did not find singleMatch in indvMatch Array");
        this.chRef.detectChanges();
      });

    });

    this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe( date => {
      this.tableDateSelected = date;
      this.getStartEndDays(this.tableDateSelected);
      this.popJuiceInRange();
      this.chRef.detectChanges();
    });

    //supposedly this is the fastest way to iterate in JS.
    this.notifySubscription = this.matchStatusService.getNotifyUserListener().subscribe( juicy => {
      console.log("IN JUICY...Updating JuicyMatch Selection");
      for (let i = 0; i < this.sortedData.length; i++){
        if(this.sortedData[i].Selection == juicy.selection && this.sortedData[i].EpochTime == juicy.epoch){
          this.sortedData[i].notify = juicy.notifyState;
          break;
        }
      }
      console.log(this.sortedData);
    });

    //set userPreference Values
    this.evFilterI = this.userPrefService.getEV();
    this.matchRatingFilter = this.userPrefService.getMR();
    this.minOddsFilter= this.userPrefService.getMinOdds();
    this.maxOddsFilter= this.userPrefService.getMaxOdds();

    //subscribe to userPreference Values
    this.prefSub = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.evFilterI = Number(tablePref.evFVI);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilter= Number(tablePref.matchRatingFilterI);
      this.secretSauceFilter= Number(tablePref.secretSauceI);
      this.fvSelected = +(tablePref.fvSelected);

      this.userCommission = this.userPrefService.getCommission();

    });

    //Watchlist Subscription
    this.watchedMatchesSubscription = this.matchStatusService.getMatchWatchStatus().subscribe( matchObject => {
      //find selection and assign correct status to it.
      this.updateMatchWatchStatus(matchObject);
      this.noMatchesToDisplay = this.matchStatusService.checkIfWatchlistEmpty();
    });
    //manually opens up Selection. Need to center view it by filtering it on it's Team Name + EpochTime.
    this.notificationSelectedSubscription = this.notificationServices.getNotificationPing().subscribe( notification => {
      this.openVIANotification(notification);
    });

    this.clearJuicySubscription = this.juicyMHService.listenToClearJuicyButton().subscribe( buttonIsClicked => {
      this.resetIsJuicy();
      console.log("Clear button Clicked!");
    });
  }


  //Populates matches in date range.
  //Need this for refreshing new matches under date criteria.
  private popJuiceInRange() {
    this.allIndvMatches.forEach(selection => {
      this.dateInRange(selection);
    });
  }

  ngOnDestroy() {

    this.streamSub.unsubscribe();
    // this.matchStatService.clear();
    this.clearJuicySubscription.unsubscribe();
    this.dateSubscription.unsubscribe();
    this.notificationSelectedSubscription.unsubscribe();
    this.notifySubscription.unsubscribe();
  }

  //   //TODO possibly hold onto old bet365 updates here? create a new field that writes old data.
  //   //TODO Also, timestamp showing last update.
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // console.log(this.dataSource.sort);
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

  resetJuicyStates(isClicked:boolean){
    if(isClicked){
      console.log("Reset all Juicy? " + isClicked);

    }
  }

  private getStartEndDays(selectedDateStr: string) {
    var dateValidator = this.dateHandlingService.returnDateSelection(selectedDateStr);
    this.startDay = dateValidator[0];
    this.endDay = dateValidator[1];
  }
  //CommissionsUpdated
  LayStake(backOdds: number, layOdds:number, steakYum: number):number{

    return this.calcLayStake(backOdds,layOdds,steakYum);
  }
  //CommissionsUpdated
  FTA(stake:number, backOdds: number, layOdds:number):number{
    var layStake =this.calcLayStake(backOdds,layOdds,stake);
    return (+stake * (+backOdds - 1) + +layStake);
  }

  //CommissionsUpdated
  TotalEV(occurence:number, stake:number, backOdds:number, layOdds:number):number{
    var layStake =  +backOdds * +stake / (+layOdds - (+this.userCommission/100));;
    var result:number = +(+stake * (+backOdds - 1) + +layStake)+ (+layStake- +stake)*(+occurence-1);
    return result;
  }
  calcLayStake(backOdds:number, layOdds:number, stake:number):number {
    return +backOdds * +stake / (+layOdds - (+this.userCommission/100));
  }


  //Match rating should also account user commission.
  NewMatchRating(backOdds:number, layOdds:number){
    return +(backOdds/(layOdds-+this.userCommission/100))*100;
  }

  NewSS(backOdds:number,layOdds:number,stake:number){
    var fta = this.FTA(stake, backOdds, layOdds);
    var ql = this.QL(backOdds, layOdds, stake);
    var qlPercentage = +(ql/fta*100).toFixed(2);
    return qlPercentage;
  }
  //CommissionsUpdated
  ROI(stake:number, backOdds: number, layOdds:number, occurence:number):number{
    var layStake = this.calcLayStake(backOdds,layOdds,stake);
    var fullTurnAround = +stake * (+backOdds -1) + +layStake;
    var ql = +(+layStake- +stake);
    var evTotal = +(fullTurnAround + ( +ql * (+occurence -1)));
    var evThisBet = + (evTotal / occurence );

    return +((evThisBet/stake)*100);
  }

  //CommissionsUpdated
  QL(backOdds: number, layOdds:number, stake:number){
    var layStake = this.calcLayStake(backOdds,layOdds,stake);
    return (+layStake*(1-this.userCommission/100) - +stake);
  }
  //layStake has commission already pre-calculated into it
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
    this.allIndvMatches.filter( (listedMatch) => {
      this.dateInRange(listedMatch);
      if(listedMatch.Selection == matchObject.Home || listedMatch.Selection == matchObject.Away) listedMatch.isWatched = matchObject.isWatched;
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
        Stake: this.userPrefService.getUserPrefferedStakes(selection.BackOdds),
        LayStake: selection.LayStake,
        BackOdds: selection.BackOdds,
        LayOdds: selection.LayOdds,
        MatchInfo: ' ',
      });
      //use a method to reset the formGroup values to selectionObject values.
    }

    //what expands  JuicyMatches
    openVIANotification(notification){

      //Get the matchObject you want to expand via notification object that was clicked.
      //notification object is => { notificationIsActivated: true, matchObject: updatedMainMatch }
      var expandItem = this.allIndvMatches.filter( match =>{
        if(match.Selection == notification.matchObject.Selection && match.EpochTime == notification.matchObject.EpochTime) {
          match.isRedirected = 'Yes';
          var index = this.allIndvMatches.indexOf(match);
          //simulate click
          this.loadGroup(index);
          this.showSelectionValues(match, index);
          //scroll to id with matchLogo + best to take match.Logo from client side stored data incase we strip away streamUpdates later.
          let identifier = match.Logo + notification.matchObject.EpochTime;
          this.scrollTo(identifier);
          return true;
        }
      });
      this.expandedElement = expandItem;
      this.chRef.detectChanges();
      console.log(notification.matchObject.Selection + " Is Expanded!!!!");
    }


    scrollTo(idTag:string){
      console.log("ID: " + idTag);
      let el = document.getElementById(idTag);
      setTimeout(()=>{
        el.scrollIntoView();

      },400);

    }

    getErrorMessage() {
      var formInput = this.selectionValues.controls;
      console.log(formInput);

      // if(formInput.minOdds.errors || formInput.maxOdds.errors || formInput.evFilterValueI.errors || formInput.evFilterValueII.errors || formInput.matchRatingFilterI.errors || formInput.matchRatingFilterII.errors || formInput.secretSauceI.errors || formInput.secretSauceII.errors){
      //   return 'Invalid entry, please enter a valid number'
      // }
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

      var activeBetObject = this.returnActiveBetObject(row, index);
      this.savedActiveBetsService.saveToActiveBets(activeBetObject);
      //Set this row to ActiveBet = true; *TODO = hide this row now.
      row.activeBet = true;
      this.notificationServices.showSABNotification(row);
      this.expandedElement = null;

    }
    //Creates an activeBet Object
    returnActiveBetObject(row,index): ActiveBet{

      var activeBetDetails = this.getGroup(index);
      var backOdd = activeBetDetails.value.BackOdds;
      var layOdd = activeBetDetails.value.LayOdds;
      var stake = activeBetDetails.value.Stake;
      var matchInfo = activeBetDetails.value.MatchInfo;

      console.log("Row Data");

      var activeBet: ActiveBet = {
        id: null,
        juId: this.userPrefService.getUserId(),
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
        isBrkzFTA: this.ftaOption == 'brooks' ? 1 : 0,
      }
      console.log("ActiveBet Saved!");
      console.log(activeBet);
      return activeBet;
    }

    resetIsJuicy(){
      this.allIndvMatches.filter( (match) => {
        //update match each time to clear matches no longer in juicy.
        this.dateInRange(match);
       if(match.isJuicy){
          match.isJuicy = false;
          match.userAware = false;
        }
      });
    }

    toggleIsTouched(selection){
      console.log("Touched!");
      console.log(selection);
      console.log(this.sortedData);



      if(selection.isJuicy && selection.userAware){
        setTimeout( () => {
          selection.userAware= false;
          selection.isJuicy = false;
          console.log("resetting values...maybe push to another service for changes?");

          console.log(selection);
        }, 1000)
      }
    }

    thisIsJuicy(selection:any):boolean{
      const userSettings = this.prefObj;
      if(selection.isWatched && selection.inRange){
        switch(this.fvSelected){
          case 1:
            return +selection['EVthisBet'] >= +userSettings.evFVI ? true: false;
          case 2:
            return +selection['MatchRating'] == +userSettings.matchRatingFilterI ||  selection['MatchRating'] > (+userSettings.matchRatingFilterI - 0.02);
          case 3:
            return +selection['QLPercentage'] == +userSettings.secretSauceI || selection['QLPercentage'] >= (+userSettings.secretSauceI);
          default: console.log("Error occurered, reload your browser or contact support");
        }
      } else {
        //count here to determine total matches to display and give default table message
        return false;
      }
    }
}


//Currently, if user is watching a match ans isPastPrime . 1. button still highlighted, and still shows up in watchList. If user clicks watch button in Fixtures, it will remove the color highlight, but not the match from watchlist.


// ( (fvSelected == 1 && +selection['EVthisBet'] >= +prefObj.evFVI) ||
//                                             (fvSelected == 2 && (+selection['MatchRating'] == +prefObj.matchRatingFilterI ||  selection['MatchRating'] > (+prefObj.matchRatingFilterI - 0.02))) ||
//                                             (fvSelected == 3 && (+selection['QLPercentage'] == +prefObj.secretSauceI || selection['QLPercentage'] >= (+prefObj.secretSauceI))))
