import {Component, OnDestroy, OnInit, ViewChild, Input , Output, OnChanges, SimpleChanges, AfterViewInit, Inject} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatchesService } from '../match/matches.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { WebsocketService } from '../websocket.service';
import { Match } from '../match/match.model';
import { NotificationBoxService } from '../notification-box.service';
import { DatePipe } from '@angular/common';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../user-properties.service';
import { DateHandlingService } from '../date-handling.service';
import { MatchStatusService } from '../match-status.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { PopupViewSavedBetsComponent } from '../popup-view-saved-bets/popup-view-saved-bets.component';

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

 displayedColumns: string[] = ['HStatus','BHome','SMHome', 'Home',  'FixturesDate', 'Away' , 'BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    @Input() matches: any;
    @Output() ignoreList: string[];
    matchStream: any;
    expandedElement: any[] | null;
    retrieveMatches = false;


    indexPositions: number[];
    tableSelected: number = 1;
    isNotInList: boolean = false;
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
      // { field: "OccH", columnDisplay: "2UP OCC. Home" },
      { field: "Home", columnDisplay: "" },
      { field: "FixturesDate", columnDisplay: "" },
      { field: "Away", columnDisplay: "" },
      // { field: "OccA", columnDisplay: "2UP OCC. Away" },
      { field: "BAway", columnDisplay: "Image" },
      { field: "SMAway", columnDisplay: "Image" },
      { field: "AStatus", columnDisplay: "" }
    ];

    masterList: any[] = [];
    masterGroup: any[];

    expandedCar: any[] = [];
    expandedSubCar: any[] = [];

    //userPreference dialog popup
    //TODO add to UserPreference
    private watchMatchesubscription: Subscription;
    private dateSubscription: Subscription;
    private groupSubscription: Subscription;
    dateSelected: string;

    watchStateChange:any;
    //main list of all matches to watch
    watchList:any[]=[];
    //list to display wrt dateSelected
    displayList: any[]=[];

    displayHeaderDate: boolean = true;

    @ViewChild(MatTable) table: MatTable<any>;


    constructor(private dateHandlingService: DateHandlingService, private matchStatusService: MatchStatusService, private userPref: UserPropertiesService, public datepipe: DatePipe, private sidenav: SidenavService , private matchesService: MatchesService, private webSocketService: WebsocketService, public dialog: MatDialog, private notificationBox: NotificationBoxService) {
     } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]


    ngOnInit() {

      //Assigns listener for any matches in view-table that are clicked to be watched.
      this.watchMatchesubscription = this.matchStatusService.getMatchWatchStatus().
      subscribe( matchObject => {
        //triggers each time watchList subject is activated in matchTable Component
        this.updateWatchList(matchObject);
      });

      this.groupSubscription = this.matchStatusService.getMasterGroup().
      subscribe( groupList => {
        this.masterGroup = groupList;
      });


          //Subscribe to Event listener in matches Service for StreamChange data. Update this.matches.
      this.dateSelected = this.userPref.getSelectedDate();

      this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe( dateSelected => {
        this.dateSelected = dateSelected;
        console.log("Date Change detected");

        this.setLists(this.watchList, this.masterGroup, this.dateSelected);
        this.dataSource.data = this.displayList;
      })

      this.ignoreList = [];
    }

  private updateWatchList(matchObject: any) {
    //Check state of match. Add or remove it.
    //date validator.
    if (matchObject.isWatched) {
      this.watchList.push(matchObject);
    } else {
      var index: number;
      index = this.watchList.indexOf(matchObject);
      this.watchList.splice(index, 1);
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
        var prevDate: string = "placeHolder";
        if(dateSelected == 'Today & Tomorrow' && groupHeader.League == match.League && (matchTime >= epochCutOff.forStartOfDayOne && matchTime  <= epochCutOff.forDayTwo) ){
          this.setDisplayHeader(match, matchPosition, groupIndex, prevDate);
          this.displayList.splice(matchPosition, 0, match);
          prevDate = match.Details;
          matchPosition++;
        }

        if(dateSelected == 'Today' && groupHeader.League == match.League && matchTime >= epochCutOff.forStartOfDayOne && matchTime <= epochCutOff.forDayOne)
        {
          this.setDisplayHeader(match, matchPosition, groupIndex, prevDate);
          this.displayList.splice(matchPosition, 0, match);
          prevDate = match.Details;
          matchPosition++;
        }
        if(dateSelected == 'Tomorrow' && groupHeader.League == match.League && matchTime >= epochCutOff.forDayOne && matchTime <= epochCutOff.forDayTwo)
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

    addFixturesDate(matchList: any[] ): any[]{

      matchList.forEach( matchObj => {
        //TODO BUG-FIX WHEN LOCALE_ID WORKS.
        if(matchObj.displayHeaderDate){
          //All of Angular is using Datepipes to conver by en-US locale, not en-GB. For the time being, everything must be converted to english Locale
          var gbDateFormat = this.dateHandlingService.switchDaysWithMonths(matchObj.Details);
          matchObj.FixturesDate = this.datepipe.transform(gbDateFormat, 'EEE dd MMM \n  HH:mm');
        }else {
          matchObj.FixturesDate = this.datepipe.transform(matchObj.Details, 'HH:mm');
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
        })
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

    // dateSelection(dateSelected:string): number[]{

    //   return this.dateHandlingService.returnDateSelection(this.dateHandlingService.returnDateSelection(dateSelected);

    // }



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
      //TODO BUG-FIX WHEN LOCALE_ID WORKS.
      //Re-arranges en-US format MM/DD into DD/MM

    ignoreAllMatchesToggle(group: Group){
      var array:any[] = []
      array.push(group.ignoreAll);
        this.matches.forEach( match => {
          if(match.League == group.League){
            array.push(match.Home);
            array.push(match.Away);
          }
        });
        this.ignoreList = array;
      //this.matchStatusService.displayIgnoreList();
    }

    ignoreHomeSelection(matchObject: any){
      matchObject.HStatus.ignore = !matchObject.HStatus.ignore;
      console.log("Ignore set to " + matchObject.HStatus.ignore + " for: " + matchObject.Home);
      this.ignoreList = [matchObject.Home, matchObject.HStatus.ignore];
      this.updateNotificationStatus(matchObject.Home, matchObject.HStatus.ignore);
    }

    ignoreAwaySelection(matchObject: any){
      //toggle ignore status.
      matchObject.AStatus.ignore = !matchObject.AStatus.ignore;
      console.log("Ignore set to " + matchObject.AStatus.ignore + " for: " + matchObject.Away);
      this.ignoreList = [matchObject.Away, matchObject.AStatus.ignore];

      this.updateNotificationStatus(matchObject.Away, matchObject.AStatus.ignore);
    }

    updateNotificationStatus(selection: string, ignoreStatus: boolean){
      if(ignoreStatus == true)
      {
        this.matchStatusService.addToIgnoreList(selection);
      } else {
        this.matchStatusService.removeFromIgnoreList(selection);
      }
    }

    removefromWatchList(row:any){
      console.log("Need functionality here");

    }

    openViewBets(row:any, selection:string): void {

      selection == 'home' ? row.Selection = row.Home: row.Selection = row.Away;
      const dialogRef = this.dialog.open(PopupViewSavedBetsComponent, {
        width: '50%',
        height: '80%',
        data: row
      });


      dialogRef.afterClosed().subscribe(result => {
        console.log('dialog is SAB popup closed, do something with data');
      });
      console.log(row);
    }

}
