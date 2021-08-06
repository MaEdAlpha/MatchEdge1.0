import {Component, OnDestroy, OnInit, ViewChild, Input , Output, OnChanges, SimpleChanges, AfterViewInit, Inject, ChangeDetectorRef} from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Match } from '../match/match.model';
import { MatchesService } from '../match/matches.service';
import { NotificationBoxService } from '../services/notification-box.service';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../services/user-properties.service';
import { DateHandlingService } from '../services/date-handling.service';
import { MatchStatusService } from '../services/match-status.service';
import { PopupViewSavedBetsComponent } from '../popup-view-saved-bets/popup-view-saved-bets.component';
import { ActiveBet } from '../models/active-bet.model';

export class Group {
  level = 0;
  expanded = false;
  League = "";
  isActive = false;
  totalCounts = 0;
  ignoreAll = false;
}

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers:[DatePipe],
})

export class WatchlistComponent implements OnInit, OnDestroy {

 displayedColumns: string[] = ['HStatus','BHome','SMHome', 'OccH','Home',  'FixturesDate', 'Away' , 'OccA','BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    @Input() matches: any;
    @Input() sabList: any;
    @Input() watchlistEnabled:number = 0;

    ftaOption:string;
    @Output() ignoreList: string[];
    matchStream: any;
    expandedElement: any[] | null;
    retrieveMatches = false;


    indexPositions: number[];
    tableSelected: number = 1;
    isNotInList: boolean = false;
    isTableEmpty: boolean = true;
    panelOpenState = false;
    viewSelectedDate:string;

    //HeaderGroup Test
    dataSource = new MatTableDataSource<any | Group>([]);
    groupByColumns: string[]=["League"];
    allData: Match[];
    _leagueGroups: any[];
    columns: any[] = [
      { field: "HStatus" , columnDisplay: "" },
      { field: "BHome", columnDisplay: "Image" },
      { field: "SMHome", columnDisplay: "Image" },
      { field: "OccH", columnDisplay: "2UP OCC. Home" },
      { field: "Home", columnDisplay: "" },
      { field: "FixturesDate", columnDisplay: "" },
      { field: "Away", columnDisplay: "" },
      { field: "OccA", columnDisplay: "2UP OCC. Away" },
      { field: "BAway", columnDisplay: "Image" },
      { field: "SMAway", columnDisplay: "Image" },
      { field: "AStatus", columnDisplay: "" }
    ];

    masterList: any[] = [];
    masterGroup: any[];

    expandedCar: any[] = [];
    expandedSubCar: any[] = [];

    //userPreference dialog popup
    //watches any watchlist toggles.
    private watchMatchesubscription: Subscription;
    //watches any date change toggles
    private dateSubscription: Subscription;
    //watches any new leauges that enter.
    private groupSubscription: Subscription;
    //watches stream
    private watchListSubscription:Subscription;
    dateSelected: string;

    watchStateChange:any;
    //main list of all matches to watch
    watchList:any[]=[];
    //list to display wrt dateSelected
    displayList: any[]=[];

    displayHeaderDate: boolean = true;

    @ViewChild(MatTable) table: MatTable<any>;


    constructor(private matchesService: MatchesService, private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService, private userPref: UserPropertiesService, public datepipe: DatePipe, private sidenav: SidenavService , public dialog: MatDialog, private notificationBox: NotificationBoxService, private chRef: ChangeDetectorRef) {
     } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]

    ngOnChanges(simpleChange: SimpleChanges) {
      if(simpleChange.watchlistEnabled && simpleChange.watchlistEnabled.currentValue == 2){
        console.log("WATCHLIST CHANGE");
        console.log(this.watchList);
        this.matchStatusService.updateLocalStorage(this.watchList);
        this.resetDateHeaders(this.displayList);
      }
    }

    ngOnInit() {
      this.ftaOption = this.userPref.getFTAOption();

      //Assigns listener for any matches in view-table that are clicked to be watched.
      this.watchMatchesubscription = this.matchStatusService.getMatchWatchStatus().
        subscribe( matchObject => {
          this.updateWatchList(matchObject);
        });

      this.groupSubscription = this.matchStatusService.getMasterGroup().
        subscribe( groupList => {
          this.masterGroup = groupList;
        });

          //Subscribe to Event listener in matches Service for StreamChange data. Update this.matches.
      this.dateSelected = this.userPref.getSelectedDate();

      this.dateSubscription = this.dateHandlingService.getSelectedDate().
        subscribe( dateSelected => {
          this.dateSelected = dateSelected;
          this.setLists(this.watchList, this.masterGroup, this.dateSelected);
          this.dataSource.data = this.displayList;
        });

      this.userPref.getUserPrefs().
        subscribe( (settings)=>{
          console.log("Min Odds settings change detected! Updating watchlist!");
          this.checkForOddsChange( +settings.minOdds, +settings.maxOdds);
          this.ftaOption = this.userPref.getFTAOption();
        });

              //StreamChange data. Updates individual matches, where toast should be triggered.
      this.watchListSubscription = this.matchesService.streamDataUpdate
      .subscribe( (streamObj) => {
        if(this.matches != undefined){
          var indexOfmatch = this.matches.findIndex( (match: { Home: string; Away: string; }) => {match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName});
          this.matches[indexOfmatch] = indexOfmatch != undefined && this.matches[indexOfmatch] ? this.matchesService.updateMatch(this.matches[indexOfmatch], streamObj) : this.matches[indexOfmatch];
        }
      });

      this.ignoreList = [];
    }

  private updateWatchList(matchObject: any) {
    if (matchObject.isWatched && !this.watchList.includes(matchObject)) {
      this.watchList.push(matchObject);
      this.isTableEmpty = false;
    } else if(!matchObject.isWatched) {
      var index: number;
      index = this.watchList.indexOf(matchObject);
      this.watchList.splice(index, 1);
      this.checkEmptyGroup(this.displayList);
    }

    //sort watchlist based off time
   this.watchList = this.watchList.sort( (a,b) => {
     return this.compareDates(a, b);
    });

    //Sort each list into their selected time. Then assign groups. Sort match to group header and assign FixtureDate format.
    this.setLists(this.watchList, this.masterGroup, this.dateSelected);
    //assign the appropriate list based off of the selected date time.
    //Also, create an event listener to dateSelected to pick the appropriate list if user is cycling through watchlist.
    //Add a default view saying "Currently no matches selected for this specification"

    //set to WatchListTable dataSource
    this.dataSource.data = this.displayList;
    //update localStorage of watchlist
    this.matchStatusService.updateLocalStorage(this.watchList);
  }

  //watchlist code ripped from addToListOnClick() in match-table.
  setLists(watchList: any[], masterGroup: Group[], dateSelected:string) {

    //clear displayList:
    this.displayList = [];
    //Assign leagueHeader object to a list only for matches selected to watch
    this.setGroupHeaders(watchList, masterGroup, this.displayList);
    //return time-boundary values to display in  table.
    var epochCutOff = this.dateHandlingService.getStartEndDaysAtMidnight();


      //need to organize list  and display fixture dates.
    this.masterGroup.forEach( groupHeader => {

      var groupIndex = this.displayList.indexOf(groupHeader);
      var matchPosition = groupIndex + 1;

      watchList.forEach( match => {
        var matchTime: number = match.EpochTime*1000;
        //prevDate acts as a switch for setting displayHeaderDate boolean.
        var prevDate: string = 'placeholder';
        if(dateSelected == 'Today & Tomorrow' && groupHeader.League == match.League && (matchTime >= epochCutOff.forStartOfDayOne && matchTime  < epochCutOff.forDayTwo) ){
          this.setDisplayHeader(match, matchPosition, groupIndex, prevDate);
          this.displayList.splice(matchPosition, 0, match);
          prevDate = match.Details;
          matchPosition++;
        }

        if(dateSelected == 'Today' && groupHeader.League == match.League && matchTime >= epochCutOff.forStartOfDayOne && matchTime < epochCutOff.forDayOne)
        {
          this.setDisplayHeader(match, matchPosition, groupIndex, prevDate);
          this.displayList.splice(matchPosition, 0, match);
          prevDate = match.Details;
          matchPosition++;
        }
        if(dateSelected == 'Tomorrow' && groupHeader.League == match.League && matchTime >= epochCutOff.forDayOne && matchTime < epochCutOff.forDayTwo)
        {
          this.setDisplayHeader(match, matchPosition, groupIndex, prevDate);
          this.displayList.splice(matchPosition, 0, match);
          prevDate = match.Details;
          matchPosition++;
        }
      });

    });
  }

  setDisplayHeader(matchObj, matchPosition, groupIndex, prevDate){
    matchObj.displayHeaderDate = false;
    (matchPosition == (groupIndex +1) || (matchObj.Details.substring(0,2) != prevDate.substring(0,2))) ? matchObj.displayHeaderDate = true : matchObj.displayHeaderDate = false;
  }

  compareDates(a, b){
    if(a.EpochTime > b.EpochTime){
      return 1;
    } else {
      return -1;
    }
  }

  //returs start and end dates as a digit
  private getStartEndDates(dateSelected: string) {
    var dateValidator: any[] = this.dateHandlingService.returnDateSelection(dateSelected);
    //start end dates based off MM + DD a a number
    var dateStart: number = dateValidator[0];
    var dateEnd: number = dateValidator[1];
    return { dateStart, dateEnd };
  }

  setGroupHeaders(watchList, masterGroup, displayList): any[]{
      masterGroup.forEach( leagueGroup => {
        const result = watchList.filter( match => match.League == leagueGroup.League).length;
        if(result >=1) {
          leagueGroup.Details = false;
          displayList.push(leagueGroup);
        }
      });
      return displayList
  }

  ngOnDestroy(){
    this.watchMatchesubscription.unsubscribe();
    this.dateSubscription.unsubscribe();
    this.groupSubscription.unsubscribe();
    this.watchListSubscription.unsubscribe();
  }

  //Handles logic for MatTable. It adds and removes match items based off the state of the League Group Header.
  modifiedGroupList(allData: any[], groupList: any[], viewSelection: string) : any[]{

    var dateValidator: number[] = this.dateHandlingService.returnDateSelection(viewSelection);

    var dateStart: number = dateValidator[0];
    var dateEnd: number = dateValidator[1];
    //console.log("DateStart: " + dateStart + " DateEnd " + dateEnd);
    //TODO BUG-FIX WHEN LOCALE_ID WORKS.

    groupList.forEach( groupObj => {
      //add group Object into masterList if not found in this.masterList.
      //FIRST IF
      if(!this.masterList.includes(groupObj)){
        this.masterList.push(groupObj);
      }

      //groupObj is expaned but is not active. =? Remove any matchObject from master list then set Group isActive to true.
      //SECOND

        var groupIndex = this.masterList.indexOf(groupObj);
        var matchPosition = groupIndex + 1;


        allData.forEach( matchObj => {
          var matchIndex = allData.indexOf(matchObj);

          //Returns matchObject time into US.
          var matchDate: number = new Date(matchObj.EpochTime * 1000).getUTCDate();
          var prevDate: number = new Date(allData[matchIndex-1].EpochTime * 1000).getUTCDate();
          //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
          if(matchObj.isWatched && matchObj.League == groupObj.League && (matchDate == dateEnd || matchDate == dateStart))
          {
            if(matchPosition == groupIndex + 1){
              matchObj.displayHeaderDate = true;
            }
            else if (matchDate != prevDate) {
              matchObj.displayHeaderDate = true;
            }
            else {
              matchObj.displayHeaderDate = false;
            }
            var index = matchPosition;
            //splice (index, number, obj) == take match object, place it in at index value, 0 means don't replace it, just insert 'matchObj' at 'index'.
            this.masterList.splice(index, 0, matchObj);
            matchPosition ++;
            groupObj.isActive = true;
          }
        });

        //If no matches within specified date were found, remove this group
        if(!groupObj.isActive){
          this.masterList.splice(groupIndex,1);
        }

      //REMOVES MATCHES FROM UNDERNEATH GROUP HEADER
      // this cleans up the matches. When you click a groupLeague that is open. It changes to expanded = false. isActive = true.

    });
    this.masterList = this.addFixturesDate(this.masterList);

    return this.masterList;
  }

  resetDateHeaders(matchList:any[]){
    var prevObject:string ="";
    var count: number = 0;
    matchList.forEach( object => {
      //reset displayHeaderDate.
      object.displayHeaderDate = false;
      var currentDate: number = new Date(object.EpochTime * 1000).getDate();
      var previousDate: number = count == 0 ? 0 : new Date( (matchList[count-1].EpochTime * 1000)).getDate();
      if(object.level == 1 || count == 0){
        //groupHeader detected
        prevObject = "groupHeader";
        count ++;
      }else if(count == 1 || prevObject == "groupHeader"){
        console.log("TRUE HDRDATE1");
        console.log(object);
        //find first match in leagueGroup
        object.displayHeaderDate = true;
        prevObject ="";
        count ++;
      } else if (currentDate != previousDate && object.League == matchList[count-1].League ){
        //find date change within same league
        console.log("TRUE HDRDATE2");
        console.log(object);
        console.log("Date compare " + currentDate + ' == ' + previousDate);
        console.log("League compare " + object.League + " vs " + matchList[count-1].League );


        object.displayHeaderDate = true;
        prevObject= "";
        count ++;
      } else {
        console.log("FALSE HDRDATE3");
        console.log(object);

        count ++;
      }
    });
    this.addFixturesDate(matchList);
  }

  addFixturesDate(matchList: any[] ): any[]{

    matchList.forEach( matchObj => {
      if(matchObj.level != 1 && matchObj.Details != undefined ){
        var localDate: Date = new Date(matchObj.EpochTime * 1000);
        if(matchObj.displayHeaderDate){
          matchObj.FixturesDate = this.datepipe.transform(localDate, 'EEE dd MMM');
          matchObj.FixturesTime = this.datepipe.transform(localDate, 'HH:mm');
        } else {
          matchObj.FixturesDate = "";
          matchObj.FixturesTime = this.datepipe.transform(localDate, 'HH:mm');
        }
      }
    });
    return matchList;
  }
  //Takes selected date and updates in match-TableComponent.
  updateFixtures($event) {
    this.viewSelectedDate = $event;
    var groupWithStates : any[] = [];
    //Case if user just toggles dates without expanding any leagues.
    if(this.masterList.length == 0){
      this.dataSource.data = this.getGroupListInit(this.allData, 0);
      //case where group(s) are expaned.
    }  else  {
      //gets all groups with current state.
      this.masterList.forEach( obj => {
        if(obj.level == 1 ){
          console.log(obj);
          console.log("put me in a new list");
          groupWithStates.push(obj);
        }
      });
      //Clears all matches in lists, leaves only Group WITH their active states.
      this.dataSource.data = this.showUpdatedView(this.allData, groupWithStates, this.viewSelectedDate);
    }
  }

  //Returns an updated list of matches Using Date selection
  showUpdatedView(allMatchData: any[], groupWithStates: any[], dateOption: string): any[] {
    this.masterList = [];
    var dateValidator: number[] = this.dateHandlingService.returnDateSelection(dateOption);
    var dateStart: number = dateValidator[0];
    var dateEnd: number = dateValidator[1];

    groupWithStates.forEach(groupHeader => {
      //populate table with groups first. Little redundant, refactor later.
      if(!this.masterList.includes(groupHeader)){
        this.masterList.push(groupHeader);
      }
      //insert matches beneath group headers with updated Date Range.
      if(groupHeader.expanded && groupHeader.isActive)
      {
        var groupIndex = this.masterList.indexOf(groupHeader);
        var matchPosition = groupIndex + 1;

        allMatchData.forEach( matchObj => {
          var matchIndex = allMatchData.indexOf(matchObj);
          //Returns correct date format for en-GB
          var matchDate: number = new Date(matchObj.EpochTime * 1000).getUTCDate();
          //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
          if(matchObj.League == groupHeader.League && (matchDate == dateEnd || matchDate == dateStart))
          {
            if(matchPosition == groupIndex + 1){
              matchObj.displayHeaderDate = true;
            }
            else if (matchObj.Details.substring(0,2) != allMatchData[matchIndex-1].Details.substring(0,2)) {
              matchObj.displayHeaderDate = true;
            }
            else {
              matchObj.displayHeaderDate = false;
            }

            var index = matchPosition;
            //splice (index, number, obj) == take match object, place it in at index value, 0 means don't replace it, just insert.
            this.masterList.splice(index, 0, matchObj);
            matchPosition ++;
          }
        });
      }
    });
    this.masterList = this.addFixturesDate(this.masterList);
    return this.masterList;
  }



  openAllGroups(){
    this._leagueGroups.forEach(element => {
      element.expanded = true;
    });
    console.log(this._leagueGroups);
  }

  //What populates View table initially. It returns an array of objects of Group class.
  getGroupListInit(matchList: any[], level: number): any[]{
    //create a group object for each league
    let groups = this.uniqueBy(
      matchList.map(matchObj => {
        const result = new Group();
        result.level = level + 1;
        for (let i = 0; i <= level; i++) {
          result['League'] = matchObj['League'];
          // result = League  row = Fixture Object. row['League']
          //console.log(row);

          //console.log("League: " + result[groupByColumns[0]] + " Home Team: " + row['Home']);
        }
        //console.log(result);
        return result;
      }),
      //Why? This is a bit dodgy code
      JSON.stringify
    );

    const currentColumn = 'League';

    groups.forEach(group => {
      //filter all data to matching brands, for each group. add total count to group property
      const rowsInGroup = matchList.filter( matchObj => group[currentColumn] === matchObj[currentColumn] );
        //  console.log(group);
        // console.log(rowsInGroup);

      group.totalCounts = rowsInGroup.length;
      //this.expandedSubCar = [];
    });

    // sort alphabetically
    groups = groups.sort((a: any, b: any) => {
      const isAsc = "asc";
      return this.compare(a.League, b.League, isAsc);
    });

    //asign groups to _leagueGroups for calling later on click() expand functionality.
    this._leagueGroups = groups;
    //returns an alphabetically organized group list
    //console.log(this._leagueGroups);
    return groups;
  }

  uniqueBy(a, key) {
    const seen = {};
    return a.filter(item => {
      const k = key(item);
      // key is JSON.stringify
      // k = {"level":1,"expanded":false,"totalCounts":0,"brand":"Jaguar"}
      //seen.hasOwnProperty(k)) passes each stringified object to filter whether that brand is registerd or not.
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  addGroupsNew(
    allGroup: any[],
    data: any[],
    groupByColumns: string[],
    dataRow: any
    ): any[] {
    return this.getSublevelNew(allGroup, data, 0, groupByColumns, dataRow);
  }

  //returns subGroup()
  getSublevelNew(
    allGroup: any[],
    data: any[],
    level: number,
    groupByColumns: string[],
    dataRow: any
  ): any[] {

    if (level >= groupByColumns.length) {
      //returns all matches without group separator.
      return data;
    }

    const currentColumn = groupByColumns[level];
    let subGroups = [];
    //console.log(allGroup);
    allGroup.forEach(group => {
      //Set a constant rowsInGroup, where each match selection and your group.league are the same
        const rowsInGroup = data.filter(
        row => group[currentColumn] === row[currentColumn]
      );
        // console.log(group[currentColumn]);
        // console.log(rowsInGroup);

      group.totalCounts = rowsInGroup.length;

      if (group.League == dataRow.League.toString()) {
        group.expanded = dataRow.expanded;
        const subGroup = this.getSublevelNew(
          allGroup,
          rowsInGroup,
          level + 1,
          groupByColumns,
          dataRow.League.toString()
        );

        this.expandedSubCar = subGroup;
        subGroup.unshift(group);
        subGroups = subGroups.concat(subGroup);

      } else {
        subGroups = subGroups.concat(group);
      }
    });
    return subGroups;
  }

  isGroup(index, item): boolean {
      return item.level;
  }

  watchForMatchUpdates() {
    this.matchStream.forEach(streamMatch => {
        this.matches.forEach( (match) => {
          //created id value
          var matchId = match.Home + " " + match.Away + " " + match.Details;
          if(matchId == streamMatch._id){
            if(streamMatch.SmarketsHomeOdds != 0 && streamMatch.SmarketsAwayOdds != 0)
              {
              match.SMHome = streamMatch.SmarketsHomeOdds;
              match.SMAway = streamMatch.SmarketsAwayOdds;
              }
              if(streamMatch.B365HomeOdds != 0 && streamMatch.B365AwayOdds != 0)
              {
                match.BHome = streamMatch.B365HomeOdds;
                match.BAway = streamMatch.B365AwayOdds;
              }
              if(streamMatch.OccurrenceAway != 0){
                match.BTTSOdds = streamMatch.B365BTTSOdds;
                match.B25GOdds = streamMatch.B365O25GoalsOdds;
                match.OccH = streamMatch.OccurenceHome;
                match.OccA = streamMatch.OccurrenceAway;
              }
              if(matchId !== streamMatch._id)
              {
                this.isNotInList = true;
              }
            } else {
            }
        })

        if(this.isNotInList || this.matches.length == 0)
        {
          console.log("not in list");
          console.log(streamMatch);
          this.isNotInList=false;
        }
      });
  }

  updateMatch(match, streamMatch){
    if(streamMatch.SmarketsHomeOdds != 0 && streamMatch.SmarketsAwayOdds != 0)
    {
      match.SMHome = streamMatch.SmarketsHomeOdds;
      match.SMAway = streamMatch.SmarketsAwayOdds;
    }
    if(streamMatch.B365HomeOdds != 0 && streamMatch.B365AwayOdds != 0)
    {
      match.BHome = streamMatch.B365HomeOdds;
      match.BAway = streamMatch.B365AwayOdds;
    }
    if(streamMatch.OccurrenceAway != 0){
      match.BTTSOdds = streamMatch.B365BTTSOdds;
      match.B25GOdds = streamMatch.B365O25GoalsOdds;
      match.BDraw = streamMatch.B365DrawOdds;
      match.OccH = streamMatch.OccurrenceHome;
      match.OccA = streamMatch.OccurrenceAway;
    }
  }

  showToast(typeOfToast: string){
    if(typeOfToast == "enableToggle"){
      this.notificationBox.enableToggleToast();
    }
    if(typeOfToast == "default"){
      this.notificationBox.showNotification();
    }
  }

  toggleSideNav(){
    this.sidenav.toggle();
  }

  openViewBets(row:any, selection:string) {
    row.Selection = selection == 'home' ?  row.Home : row.Away;
    row.fta = selection == 'home' ? row.OccH : row.OccA;
    const list: ActiveBet[] = this.sabList;
    this.matchesService.openSABPopup(row, list);
  }

  toggleNotification(matchObj:any, isHome:boolean):void{
    isHome ? matchObj.HStatus.notify = !matchObj.HStatus.notify : matchObj.AStatus.notify = !matchObj.AStatus.notify;
    //update match-status.services.
    this.updateMatchStatusList(matchObj, isHome);
  }

  updateMatchStatusList(matchObj:any, isHome:boolean):void{
    this.matchStatusService.updateWatchList(matchObj, isHome);
  }

  //when userPreferences is updated by user, this will change the notify status of the match
  checkForOddsChange(minOdds:number, maxOdds:number):void{

    this.displayList.forEach( rowData => {
      if(rowData.level == undefined){
        rowData.HStatus.notify = +rowData.BHome >= +minOdds && +rowData.BHome <= +maxOdds ? true : false;
        rowData.AStatus.notify = +rowData.BAway >= +minOdds && +rowData.BAway <= +maxOdds ? true : false;

        //pass row data specifying t/f home/away
        this.updateMatchStatusList(rowData, true);
        this.updateMatchStatusList(rowData,false);
        console.log("--Check for Odds Change--");

        console.log("--------------------------------------------------------------------------------------------------------");
        console.log("Home Back Odds |  >= userMinOdds? " + (+rowData.BHome >= +minOdds)+ " <= maxOdds " + (+rowData.BHome <= +maxOdds));
        console.log("Away Back Odds |  >= userMinOdds? " + (+rowData.BAway >= +minOdds)+ " <= maxOdds " + (+rowData.BAway <= +maxOdds));
        console.log("--------------------------------------------------------------------------------------------------------");


      }
    });
  }

  checkEmptyGroup(displayList:any):void{
    // console.log("List:" + displayList.length);
    var i:number = 0;

    displayList.forEach( (displayObj, index) => {
      displayObj.level == undefined ? i++ : null;

      if(displayObj.level !=undefined && displayObj.level == 1){
        //
      }
    });

    this.isTableEmpty= i == 0 ? true : false;
  }

  triggerRemoveIcon(selection: any){
    console.log("Trigger Remove From Watchlist Functionality here.")
    console.log(selection);
  }
}
