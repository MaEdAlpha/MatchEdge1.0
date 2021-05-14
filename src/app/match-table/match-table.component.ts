import { Component, OnDestroy, OnInit, OnChanges, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, Input} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatchesService } from '../match/matches.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { WebsocketService } from '../websocket.service';
import { Match } from '../match/match.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { StatusDisableDialogueComponent } from '../status-disable-dialogue/status-disable-dialogue.component';
import { ToastrService } from 'ngx-toastr';
import { NotificationBoxService } from '../services/notification-box.service';
import { DatePipe, getLocaleDateFormat } from '@angular/common';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../services/user-properties.service';
import { MatchStatusService } from '../services/match-status.service';
import { DateHandlingService } from '../services/date-handling.service';
import { Observable } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { ActiveBet } from '../models/active-bet.model';
import { PopupViewSavedBetsComponent } from '../popup-view-saved-bets/popup-view-saved-bets.component';

  export class Group {
    level = 0;
    expanded = false;
    League = "";
    isActive = false;
    totalCounts = 0;
    watchAll = false;
    isToday = false;
    isTomorrow = false;
  }

  @Component({
    templateUrl: './match-table.component.html',
    styleUrls: ['./match-table.component.css'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
    providers:[DatePipe],
  })

  export class MatchTableComponent implements OnInit, OnDestroy {

    displayedColumns: string[] = ['HStatus','BHome','SMHome', 'Home',  'FixturesDate', 'Away', 'BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    matches: any;
    savedActiveBets: ActiveBet[];
    @Output() ignoreList: string[];
    @Input() isLoading: boolean;
    matchStream: any;
    expandedElement: any[] | null;
    retrieveMatches = false;
    tableCount: any;
    matchWatched: string[] = [];
    indexPositions: number[];
    tableSelected: number = 1;
    hideFixtures: boolean = true;
    hideJuicy: boolean = true;
    hideActive: boolean = true;
    isNotInList: boolean = false;
    panelOpenState = false;
    viewSelectedDate:string;
    ftaOption: string;
    masterToggle: boolean;


    //HeaderGroup Test
    dataSource = new MatTableDataSource<any | Group>([]);
    groupByColumns: string[]=["League"];

    _allGroup: any[];
    tableGroups: any[];
    masterGroup: any[];

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
      { field: "AStatus", columnDisplay: "" },
      { field: "EpochTime", columnDisplay: ""}
    ];
    masterList: any[] = [];
    viewTableList: any[] = [];

    expandedCar: any[] = [];
    expandedSubCar: any[] = [];

    //TODO add to UserPreference
    dialogDisabled: boolean;
    displayHeaderDate: boolean = true;

    private matchesSub: Subscription;
    private dateSubscription: Subscription;
    private tableSubscription: Subscription;
    private sabSubscription: Subscription;
    private firstPass = true;
    todayDate: number;
    tomorrowDate: number;

    constructor(private savedActiveBetsService: SavedActiveBetsService, private chRef: ChangeDetectorRef, private userPref: UserPropertiesService, public datepipe: DatePipe, private sidenav: SidenavService , private matchesService: MatchesService, private webSocketService: WebsocketService, public dialog: MatDialog, private notificationBox: NotificationBoxService, private matchStatusService: MatchStatusService, private dateHandlingService: DateHandlingService) {
    }

    ngOnInit() {
      //INIT
      this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
      this.viewSelectedDate = this.userPref.getSelectedDate();
      this.setStartEndDays(this.viewSelectedDate);
      this.ignoreList = [];
      this.tableGroups = [];
      this.savedActiveBets = this.savedActiveBetsService.getActiveBets();
      this.ftaOption = this.userPref.getFTAOption();
      this.masterToggle = false;

      //Subscribe to changes you want upudates on /Matches/Dates/StreamWatch/UserPreferences

      //Populate Master SAB List upon loading website.
      this.sabSubscription = this.savedActiveBetsService.getsabUpdatedListener().subscribe( (sabData: any) => {
        this.savedActiveBets = sabData;
        console.log("SABLIST Populated");
        console.log(this.savedActiveBets);
      });

      //Listense for updates to SAB. This dynamically populates SAB list.
      this.savedActiveBetsService.getSabListObservable().subscribe( sabUpdate => {
                                                                          this.savedActiveBets.push(sabUpdate);
                                                                        }
                                                          );

      //Listens for any DELETE requests made to DB. Returns ObjectId, and removes locally stored object.
      this.savedActiveBetsService.removeFromList.subscribe( sabId => {
                                                                      //Refreshes list to reflect removed SAB.
                                                                        this.savedActiveBets = this.savedActiveBets
                                                                        .filter( sab => {
                                                                                          if(sab.id == sabId){
                                                                                            console.log("S.A.B: " + sab.id + " Removed form DB!");
                                                                                            var index =  this.savedActiveBets.indexOf(sab);
                                                                                            this.savedActiveBets.splice(index,1);
                                                                                            return false;
                                                                                          } else {
                                                                                            return true;
                                                                                          }
                                                                                        }
                                                                              )
                                                                      }
                                                            );

      this.userPref.getUserPrefs().subscribe( () => {
        //This gets called everytime the form is saved, but we aren't collecting form data.
        setTimeout(()=>{
          this.ftaOption = this.userPref.getFTAOption();
        },500);
      });
      //Initializes matches -> Selections.

      this.matchesSub = this.matchesService.getMatchUpdateListener()
      .subscribe( ( matchData: any) => {
                                          //Takeout bad data
                                          this.matches = this.sanitizeList(matchData);
                                          console.log("Sanitize...");
                                          //loadingMatches is finished
                                          this.matchesService.loadingMatches(false);
                                          // console.log(this.matches);

                                          // Set up and clean groups
                                          this.buildGroupHeaders(this.matches, 0);
                                          this.cleanGroups(this.masterGroup);
                                          //assign only league groups that match user selected date
                                          this.setGroupsToDate(this.masterGroup);
                                          console.log("--------MATCHES------------");

                                          console.log(this.matches);

                                          // Click League headers feature.
                                          this.tableGroups.forEach( group => {
                                                                              this.dataSource.data = this.addToListOnClick(this.matches, this.tableGroups, group);
                                                                            }
                                                                  );
                                        }
                 );

      //StreamChange data. Updates individual matches, where toast should be triggered.
     this.tableSubscription = this.matchesService.streamDataUpdate
      .subscribe( (streamObj) => {
        var indexOfmatch = this.matches.findIndex( match => match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName);
        indexOfmatch != undefined && this.matches[indexOfmatch] ? this.updateMatch(this.matches[indexOfmatch], streamObj) : console.log( streamObj.HomeTeamName + " vs. " + streamObj.AwayTeamName + " not found");

        //Execute a simple cycle to see if EpochTime*1000 < Date.Now()
        //If it is, then change set to Inactive. and set a boolean to reset the next fixturesDate header.
        this.checkDateHeaders();
      });

      //Update Start/End Dates
      this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe(dateSelection => {
        this.viewSelectedDate = dateSelection;
        this.setStartEndDays(dateSelection);
        this.tableGroups=[];
        this.cycleFixtures();
      });

      //LIVE UPDATES UNCOMMENT
      this.webSocketService.openWebSocket();
    }
    //Sends match to matchStatusService which Juicy subscribes to.
    sendToWatchListService(matches: any) {
      matches.forEach(match => {
        this.matchStatusService.watchMatchSubject(match);
      });
    }

    ngAfterViewInit(){
    }

    ngOnDestroy(){
      this.matchesSub.unsubscribe();
      //LIVE UPDATES UNCOMMENT
      this.tableSubscription.unsubscribe();
      this.webSocketService.closeWebSocket();
      this.dateSubscription.unsubscribe();
    }



    //Creates Group headers. Should only be called once in your code, or it resets the state of these LeagueGroupHeaders
    buildGroupHeaders(matches: any[], level: number){
      //create a group object for each league
      const leagueName = 'League';
      var epochCutOff = this.getStartEndDaysAtMidnight();

      let groups = this.filterGroups(
        matches.map( match => {

            const groupObj = new Group();
            groupObj.level = level + 1;
            for (let i = 0; i <= level; i++) {
              groupObj[leagueName] = match[leagueName];
            }
            return groupObj;
      }), JSON.stringify);
      console.log("Groups created:...");
      // console.log(groups);

      //Assign values to class object
      // var assignTodaysDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[0];
      // var assignTomorrowsDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[1];

      // console.log("RAW GROUPS + Dates for Filtering Groups");
      groups.forEach(group => {
        //Assiging League value to leagueGroupObject
        const matchesInLeagueGroup = matches.filter(matchObj => group[leagueName] == matchObj[leagueName]);
        var switch1: boolean = true;
        var switch2: boolean = true;
        // console.log(group);
        // console.log(matchesInLeagueGroup);
        matchesInLeagueGroup.forEach( match => {
          //var matchDate: number = new Date(match.EpochTime *1000).getUTCDate();
          // console.log(matchDate);
          // console.log(assignTodaysDay + " " + assignTomorrowsDay);

          if( switch1 && ( match.EpochTime*1000 < epochCutOff.forDayOne && match.EpochTime*1000 > epochCutOff.forStartOfDayOne )){
            group.isToday = true;
            switch1 = false;
          }
          if( switch2 && ( match.EpochTime*1000 >= epochCutOff.forDayOne && match.EpochTime*1000 <= epochCutOff.forDayTwo ) ){
            group.isTomorrow = true;
            switch2 = false
          }
        });
        //Assign Total Count of matches in that league
        group.totalCounts = matchesInLeagueGroup.length;

      });
      //sort groups alphabetically

      groups = groups.sort((a: any, b: any) => {
        return this.compare(a.League, b.League);
      });
      this.masterGroup = groups
      //console.log(groups);
    }

    private compare(a, b) {
      return (a < b ? -1 : 1);
    }
    //used solely incase we start scraping ahead of time and have matches in leagues that don't fall within the date times.
    cleanGroups(groups){
      //Filter Groups
      function nonRelevantGroups( group ) {
        if( (group.isToday || group.isTomorrow) && group.League != null )
        { return true; }
      }
      groups = groups.filter(nonRelevantGroups);
      this.saveMasterGroup(groups);
      this.masterGroup = groups
    }

    //Study this snippet more. Returns only one unique GroupObject.
    filterGroups(rawGroupList, key){
      const uniqueGroup = {};
      return rawGroupList.filter( groupItem => {
        const groupValue = key(groupItem);
        return uniqueGroup.hasOwnProperty(groupValue) ? false : (uniqueGroup[groupValue] = true);
      });
    }

    //handles clicking of league group headers
    displayMatches(row) {
        row.expanded = !row.expanded;
      if (row.expanded) {
        row.ignoreAll ? this.showToast("enableToggle") : this.dataSource.data = this.addToListOnClick(this.matches, this.tableGroups, row);
      }
      else {
         this.dataSource.data = this.removeFromListOnClick(this.viewTableList, this.tableGroups, row);
      }
    }

    //sets tableGroups based off of date selected.
    setGroupsToDate(masterGroup): any[]{

      this.viewTableList=[];
      this.tableGroups=[];
      masterGroup.forEach( group => {
        if(this.viewSelectedDate == 'Today' && group.isToday){
            group.expanded = true;
            this.tableGroups.push(group);
        }
        else if (this.viewSelectedDate == 'Tomorrow' && group.isTomorrow) {
            group.expanded = true;
            this.tableGroups.push(group);
        }
        else if (this.viewSelectedDate == 'Today & Tomorrow' && (group.isTomorrow || group.isToday) ) {
            group.expanded = true;
            this.tableGroups.push(group);
        }
      });
      return this.tableGroups;
    }
    //when date selector is changed, update tableGroups
    cycleFixtures() {
      if(this.nothingExpanded(this.masterGroup)){
        this.dataSource.data = this.setGroupsToDate(this.masterGroup);
      } else {
        this.dataSource.data = this.reReReload(this.matches, this.setGroupsToDate(this.masterGroup));
      }
    }

    reReReload(allMatches, tableGroups): any[]{
      var viewTableList: any[] = [];
      tableGroups.forEach( group => {
        if(group.expanded){
          viewTableList = this.addToListOnClick(allMatches, tableGroups, group);
        }
      });
      return viewTableList;
    }

    //checks to see if any league headers containers are open.
    nothingExpanded(masterGroup: any[]): boolean {
      //Get list of groups based off selected date.
      var groupListSelected: any[] = this.setGroupsToDate(masterGroup);
      const leaguesExpanded = groupListSelected.filter(group => group.expanded);
      var result = leaguesExpanded.length == 0 ? true : false;
      return result;
    }
    //Adds matches underneath their respective League header.
    addToListOnClick(allMatches, tableGroups, rowInfo): any[] {

      //assign league group to viewTable List.
      tableGroups.forEach(leagueGroup => {
        if(!this.viewTableList.includes(leagueGroup)){
          this.viewTableList.push(leagueGroup);
        }
      });
      //Get the index of the League header clicked.
      var groupIndex = this.viewTableList.indexOf(rowInfo);

      //Set the first displayed match to index position +1 of groupIndex.
      var matchPosition = groupIndex + 1;
      var timeNow = Date.now();
      var epochCutOff = this.getStartEndDaysAtMidnight();

      allMatches.forEach( match => {
        //Get Match Date only
        var matchEpoch: number = match.EpochTime*1000;
        //Find the position of the match in the MasterList form DB.
        var matchIndex: number = allMatches.indexOf(match);
        //Sometimes a full scrape of a record is not done, and League = '' or null. Need to account for that null.
        if(match.League != null && match.League.includes(rowInfo.League)){
          //Conditional for Today&Tomorrow .
          if(this.viewSelectedDate == 'Today & Tomorrow' && ( matchEpoch >= epochCutOff.forStartOfDayOne && matchEpoch <= epochCutOff.forDayTwo )) {
            //Sets inactive Styling for table row.
            matchEpoch <= timeNow ? match.isPastPrime = true : match.isPastPrime = false; //Set boolean for styling

            this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
            this.viewTableList.splice(matchPosition, 0, match);
            matchPosition++;
          }
          //Conditional for Today
          if(this.viewSelectedDate == "Today" && (matchEpoch <= epochCutOff.forDayOne && matchEpoch >= epochCutOff.forStartOfDayOne )) {

            matchEpoch <= timeNow ? match.isPastPrime = true : match.isPastPrime = false; //Set boolean for styling

            this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
            this.viewTableList.splice(matchPosition, 0 , match);
            matchPosition++;
          }
          //Conditional for Tomorrow only.
          if(this.viewSelectedDate == "Tomorrow" && (matchEpoch <= epochCutOff.forDayTwo && matchEpoch >= epochCutOff.forDayOne)){
            this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
            this.viewTableList.splice(matchPosition, 0, match);
            matchPosition++;
          }
        }


      });
        //setup match time format the client displays on the view table
        this.viewTableList = this.addFixturesDate(this.viewTableList);
        console.log("Edited list with added Fixture Dates");

        // console.log(this.viewTableList);

        return this.viewTableList
    }

      //Compare previous date with current. If they're the same, mark current displayHeaderDate -> false.
      setDisplayHeader(match, matchPosition, allMatchIndex, groupIndex, allMatches){
        var currentDate: number = new Date(match.EpochTime * 1000).getDate();
        var previousDate: number;
        allMatchIndex == 0 ? previousDate = 0 : previousDate = new Date((allMatches[allMatchIndex-1].EpochTime * 1000)).getDate();
        var currentMatchObj: any = allMatches[allMatchIndex]
        var previousMatchObj: any = allMatches[allMatchIndex - 1];

        //If first in the list, or a new date, set true.
        (matchPosition == (groupIndex + 1) || (previousDate != 0 && currentDate != previousDate && match.League == previousMatchObj.League)) ? match.displayHeaderDate = true : match.displayHeaderDate = false;
         //If current match and previous match are of the same league, and the previous match is pastPrime. display the date header.
        ( allMatchIndex > 0 && currentMatchObj.League == previousMatchObj.League && previousMatchObj.isPastPrime == true && currentMatchObj.isPastPrime != previousMatchObj.isPastPrime && currentMatchObj.EpochTime*1000 < Date.now() ) ? match.displayHeaderDate = true : '';
        }

      removeFromListOnClick(viewTableList, tableGroups, rowInfo): any[] {

        function removedMatches(item) {
          if(tableGroups.includes(item) || item.League != rowInfo.League){
            return true;
          }
        }

        const result = viewTableList.filter(removedMatches);

        this.viewTableList = result;

      return this.viewTableList
    }

    //filter incomplete match records. Could cause future bug. if initial scrape is postponed. Refresh on client side should solve this...maybe filter this further down the road.
    private sanitizeList(matches: any): any[]{
      //filter data based off incompleteData
      function incompleteData(match){
        if(match.League != null && match.BAway != 999 && match.Details != null && match.BAway != 0 && match.SMAway != 0 && match.EpochTime != undefined && match.EpochTime != 0){
          return true;
        }
      }
      const cleanList = matches.filter(incompleteData);
      return cleanList;
    }

    private setStartEndDays(dateSelection: any) {
      var dateValidator: number[] = this.dateHandlingService.returnDateSelection(dateSelection);

      //assign date of the month.
      this.todayDate = dateValidator[0];
      this.tomorrowDate = dateValidator[1];
    }

    private getStartEndDaysAtMidnight() {
      //today at midnight is counted as the next day... so when you filter, if you want to include any games at midnight it must be equal to this number.
      var yesterdayAtMidnight = new Date(new Date().setDate( new Date().getDate())).setHours(0,0,0,0);
      var todayAtMidnight = new Date(new Date().setDate( new Date().getDate() + 1)).setHours(0,0,0,0);
      var tomorrowAtMidnight = new Date(new Date().setDate( new Date().getDate() + 2)).setHours(0,0,0,0)
      return { forStartOfDayOne: yesterdayAtMidnight, forDayOne: todayAtMidnight, forDayTwo: tomorrowAtMidnight}
    }

    //Date formatter
    addFixturesDate(matchList: any[] ): any[]{
      console.log("Fixture Date setup in progress...");
      // console.log(matchList);
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

    //maybe use for later on default match opened
    openAllGroups(){
      this._allGroup.forEach(element => {
        element.expanded = true;
      });
      console.log(this._allGroup);
    }

    //toggle each table type
    displaySelectedTable(fixtureBtnClicked: number){
      console.log('tableSelected!!!: ' + fixtureBtnClicked);

      this.tableSelected = fixtureBtnClicked;
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
                  console.log("In BTTS area " + typeof streamMatch.OccurrenceAway);
                }
                if(matchId !== streamMatch._id)
                {
                  this.isNotInList = true;
                }
              } else {
              }

          });

          if(this.isNotInList || this.matches.length == 0)
          {
            // console.log("not in list");
            // console.log(streamMatch);
            this.isNotInList=false;
          }
        });
    }

    enableMatchButton(match: any)
    {
      for(var i=0; i < this.matches.length; i++){
        if( match.Home === this.matches[i].Home && match.Away === this.matches[i].Away){
          this.matchWatched[i] = 'false';
          console.log("Testing index call " + this.matches.findIndex(match))
        }
      }
    }

    disableButton(index:any)
    {
      this.matchWatched[index]='true';
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
      this.chRef.detectChanges();

    }

    //expands and collapses container
    collapseGroup(row:any)
    {
      if(row.expanded == true)
      {
        this.dataSource.data = this.removeFromListOnClick(this.viewTableList, this.tableGroups, row);
        row.expanded == false;
      }
    }

    watchAllMatches(groupRow:any):void{
      console.log("----------------------------------- Watch All Of " + groupRow.League + "-----------------------------------\n Adding all matches to watchMatchSubject & watchList in matchStatus Services");
      // console.log(this.matches);
      var epochCutOff = this.getStartEndDaysAtMidnight();
      //filter by league
      const leagueMatches = this.matches.filter( (match) => {
        var matchEpoch:number = match.EpochTime*1000;
          if(match.League == groupRow.League && ( matchEpoch >= epochCutOff.forStartOfDayOne && matchEpoch <= epochCutOff.forDayTwo ))
          {
            match.isWatched = groupRow.watchAll ? true : false;
            this.toggleNotification(match, true);
            this.toggleNotification(match,false);

            return true;
          }
      });



      // console.log(leagueMatches);
      leagueMatches.forEach( (match)=> {
        if(groupRow.watchAll){
          this.matchStatusService.addToWatchList(match);
          this.matchStatusService.watchMatchSubject(match);
        } else {
          console.log("Removed from List: " + match.Home + " v " + match.Away);
          this.matchStatusService.removeFromWatchList(match);
          this.matchStatusService.watchMatchSubject(match);
        }
      });
      // console.log("Watchlist:");
      // console.log(this.matchStatusService.getWatchList());
      // console.log("----------------------------------------------------------------------");
      return leagueMatches;
    }

    watchAllLeagues():void{
      this.masterToggle = !this.masterToggle;
      var epochCutOff = this.getStartEndDaysAtMidnight();

      this.masterGroup.forEach( group => {
        group.watchAll = this.masterToggle;
      });

      this.matches.forEach( match => {
        var matchTime = match.EpochTime*1000
        if(matchTime >= Date.now() && matchTime <= epochCutOff.forDayTwo ){
          match.isWatched = this.masterToggle;
          match.HStatus.notify = this.masterToggle;
          match.AStatus.notify = this.masterToggle;
          this.updateMatchStatusList(match, true);
          this.updateMatchStatusList(match, false);
          this.updateJuicyNotifyStatus(match, true);
          this.updateJuicyNotifyStatus(match, false);

          if(this.masterToggle){
            this.matchStatusService.addToWatchList(match);
            this.matchStatusService.watchMatchSubject(match);
          } else {
            this.matchStatusService.removeFromWatchList(match);
            this.matchStatusService.watchMatchSubject(match);
          }
        }
      });
    }


     openPopUp($event: MatSlideToggleChange, groupItem: any) {

    //   if($event.checked == false && !this.dialogDisabled){
    //     //if Turning toggle to "OFF", popup dialog box to warn user.
    //     let dialogRef =  this.dialog.open(StatusDisableDialogueComponent);

    //     dialogRef.afterClosed()
    //       .subscribe( result => {
    //         //If user selects "Cancel" then they CONTINUE to watch the league's matches. result = false.
    //         //If user selects "Okay" they DISABLE all notifications for that league. result = true.
    //         if(result == 'false') {
    //           $event.source.checked = true;
    //           //TODO send this groupItem to another method. Notifications Services.
    //         }
    //         if(result == 'true') {
    //           $event.source.checked = false;
    //           groupItem.ignoreAll = true;
    //         }
    //       });
    //   } else if ($event.checked == true && !this.dialogDisabled) {
    //     //if toggle is being clicked "ON", turn on Notifications.
    //     groupItem.ignoreAll = false;
    //   } else if (this.dialogDisabled) {
    //     //If user has selected to ignore popups, then set notifications based off $event.checked
    //       $event.source.checked == true ? groupItem.ignoreAll = false : groupItem.ignoreAll = true;
    //       console.log("GroupItem: " + groupItem.League + "- ignoreAll: " + groupItem.ignoreAll);

    //   } else if ($event.checked == false && this.dialogDisabled){
    //     groupItem.ignoreAll = true;
    //   }
    //     // this.ignoreAllMatchesToggle(groupItem);
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
      //TODO BUG-FIX WHEN LOCALE_ID WORKS.
      //Re-arranges en-US format MM/DD into DD/MM
    // ignoreAllMatchesToggle(group: Group){
    //   var array:any[] = []
    //   array.push(group.ignoreAll);
    //     this.matches.forEach( match => {
    //       if(match.League == group.League){
    //         array.push(match.Home);
    //         array.push(match.Away);
    //       }
    //     });
    //     this.ignoreList = array;
    //   //this.matchStatusService.displayIgnoreList();
    // }
    //DON'T NEED

    // ignoreHomeSelection(matchObject: any){
    //   matchObject.HStatus.ignore = !matchObject.HStatus.ignore;
    //   console.log("Ignore set to " + matchObject.HStatus.ignore + " for: " + matchObject.Home);
    //   this.ignoreList = [matchObject.Home, matchObject.HStatus.ignore];
    //   this.updateNotificationStatus(matchObject.Home, matchObject.HStatus.ignore);
    // }

    // ignoreAwaySelection(matchObject: any){
    //   //toggle ignore status.
    //   matchObject.AStatus.ignore = !matchObject.AStatus.ignore;
    //   console.log("Ignore set to " + matchObject.AStatus.ignore + " for: " + matchObject.Away);
    //   this.ignoreList = [matchObject.Away, matchObject.AStatus.ignore];

    //   this.updateNotificationStatus(matchObject.Away, matchObject.AStatus.ignore);
    // }

    // updateNotificationStatus(selection: string, ignoreStatus: boolean){
    //   // ignoreStatus ? this.matchStatusService.addToIgnoreList(selection) : this.matchStatusService.removeFromIgnoreList(selection);
    // }

    addToWatchList(rowData:any){
      console.log(rowData);
      rowData.isWatched = !rowData.isWatched;
      console.log("RowData.isWatched set to " + rowData.isWatched);

      if(rowData.isWatched){
        this.matchStatusService.addToWatchList(rowData);
        this.matchStatusService.watchMatchSubject(rowData);
      } else {
        this.matchStatusService.removeFromWatchList(rowData);
        this.matchStatusService.watchMatchSubject(rowData);
      }
    }

    openViewBets(row:any, selection:string): void {

      selection == 'home' ? row.Selection = row.Home: row.Selection = row.Away;
      const list: ActiveBet[] = this.savedActiveBets;
      console.log(this.savedActiveBets);

      //filtered SAB List based off selection.

      const matDialogConfig = new MatDialogConfig();
      matDialogConfig.width = '70%';
      matDialogConfig.height ='80%';
      matDialogConfig.data = {row, list};
      const dialogRef = this.dialog.open(PopupViewSavedBetsComponent, matDialogConfig);


      dialogRef.afterClosed().subscribe(result => {
        console.log('dialog is SAB popup closed, do something with data');
      });
    }

    saveMasterGroup( masterGroup: any){
      this.matchStatusService.watchGroupSubject( masterGroup );
    }
    //returns true if match time is less than current time.
    oldNews(epochTime:number): boolean {
       return (epochTime*1000 < Date.now());
    }

    checkDateHeaders():void{
      // this.viewTableList = this.hideFixtures
    }


    toggleNotification(matchObj:any, isHome:boolean):void{

      isHome ? matchObj.HStatus.notify = !matchObj.HStatus.notify : matchObj.AStatus.notify = !matchObj.AStatus.notify;
      //update match-status.services.
      this.updateMatchStatusList(matchObj, isHome);
      this.updateJuicyNotifyStatus(matchObj, isHome);
    }

    //Assign a button that updates JuicyTable Notify status.
    updateJuicyNotifyStatus(match: any, isHome:boolean){
      console.log("NOTIFY: In Match-Table");
      console.log(match);
      //juicy: {selection:string, notifyState:boolean}
      let juicy = isHome? {selection: match.Home, notifyState: match.HStatus.notify, epoch: match.EpochTime} : {selection: match.Away, notifyState: match.AStatus.notify, epoch: match.EpochTime};

      this.matchStatusService.notifyUser(juicy);
    }

    updateMatchStatusList(matchObj:any, isHome:boolean):void{
      this.matchStatusService.updateWatchList(matchObj, isHome);
    }
}

