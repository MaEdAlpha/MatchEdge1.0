import { Component, OnDestroy, OnInit, ViewChild, Input , AfterViewInit, Output, EventEmitter} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatchesService } from '../match/matches.service';
import { MatDialog } from '@angular/material/dialog';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { WebsocketService } from '../websocket.service';
import { Match } from '../match/match.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { StatusDisableDialogueComponent } from '../status-disable-dialogue/status-disable-dialogue.component';
import { ToastrService } from 'ngx-toastr';
import { NotificationBoxService } from '../notification-box.service';
import { DatePipe } from '@angular/common';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../user-properties.service';
import { MatchStatusService } from '../match-status.service';
import { DateHandlingService } from '../date-handling.service';


  export class Group {
    level = 0;
    expanded = false;
    League = "";
    isActive = false;
    totalCounts = 0;
    ignoreAll = false;
    isToday = false;
    isTomorrow = false;
  }

  @Component({
    selector: 'app-match-table',
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

    displayedColumns: string[] = ['HStatus','BHome','SMHome', 'OccH', 'Home',  'FixturesDate', 'Away', 'OccA' , 'BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    matches: any;
    @Output() ignoreList: string[];
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
      { field: "AStatus", columnDisplay: "" }
    ];
    masterList: any[] = [];
    viewTableList: any[] = [];

    expandedCar: any[] = [];
    expandedSubCar: any[] = [];
    //userPreference dialog popup
    //TODO add to UserPreference
    preferenceSubscription: Subscription;
    dialogDisabled: boolean;
    displayHeaderDate: boolean = true;

    @ViewChild(MatTable) table: MatTable<any>;

    private matchesSub: Subscription;
    private dateSubscription: Subscription;
    private firstPass = true;
    dateStart: number;
    dateEnd: number;

    constructor(private userPref: UserPropertiesService, public datepipe: DatePipe, private sidenav: SidenavService , private matchesService: MatchesService, private webSocketService: WebsocketService, public dialog: MatDialog, private notificationBox: NotificationBoxService, private matchStatusService: MatchStatusService, private dateHandlingService: DateHandlingService) {
    }

    ngOnInit() {
      //INIT
      this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
      this.viewSelectedDate = this.userPref.getSelectedDate();
      this.dialogDisabled = this.userPref.getDialogDisabled();
      this.setStartEndDays(this.viewSelectedDate);
      this.ignoreList = [];
      this.tableGroups = [];
      //Subscribe to changes you want upudates on /Matches/Dates/StreamWatch/UserPreferences

      //Changes to match data
      this.matchesSub = this.matchesService.getMatchUpdateListener() //subscribe to matches for any changes.
      .subscribe(( matchData: any) => {
        //Takeout bad data

        this.matches = this.sanitizeList(matchData);
        // Set up and clean groups
        this.buildGroupHeaders(this.matches, 0);
        this.cleanGroups(this.masterGroup);
        //assign only league groups that match user selected date
        this.dataSource.data = this.setGroupsToDate(this.masterGroup);
        // console.log("--Matches From DB--");
        // console.log(this.matches);
      });

      //UserPreferences
      this.preferenceSubscription = this.userPref.getUserPrefs()
      .subscribe( userPrefs => {
        this.dialogDisabled = userPrefs.dialogDisabled;
      });

      //StreamChange data. Updates individual matches
      this.matchesService.streamDataUpdate
      .subscribe( (streamObj) => {
        var indexOfmatch = this.matches.findIndex( match => match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName);
        indexOfmatch != undefined && this.matches[indexOfmatch] ? this.updateMatch(this.matches[indexOfmatch], streamObj) : console.log("not found");
      });

      //Update Start/End Dates
      this.dateSubscription = this.dateHandlingService.getSelectedDate().subscribe(dateSelection => {
        this.viewSelectedDate = dateSelection;
        this.setStartEndDays(dateSelection);
        this.tableGroups=[];
        this.cycleFixtures();
      })
      //LIVE UPDATES UNCOMMENT
      this.webSocketService.openWebSocket();
    }

    ngOnDestroy(){
      this.matchesSub.unsubscribe();
      //LIVE UPDATES UNCOMMENT
      this.webSocketService.closeWebSocket();
      this.dateSubscription.unsubscribe();
      this.preferenceSubscription.unsubscribe();
    }

    //Creates Group headers. Should only be called once in your code, or it resets the state of these LeagueGroupHeaders
    buildGroupHeaders(matches: any[], level: number){
      //create a group object for each league
      const leagueName = 'League';

      let groups = this.filterGroups(
        matches.map( match => {

            const groupObj = new Group();
            groupObj.level = level + 1;
            for (let i = 0; i <= level; i++) {

              groupObj[leagueName] = match[leagueName];
            }
            return groupObj;

      }), JSON.stringify);

      //Assign values to class object
      var todaysDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[0];
      var tomorrowsDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[1];

      // console.log("RAW GROUPS + Dates for Filtering Groups");
      groups.forEach(group => {
        //Assiging League value to leagueGroupObject
        const matchesInLeagueGroup = matches.filter(matchObj => group[leagueName] === matchObj[leagueName]);
        var switch1: boolean = true;
        var switch2: boolean = true;

        //Assign dateBooleans for filtering later.
        matchesInLeagueGroup.forEach( match => {
          if(switch1 && (+match.Details.substring(0,2) == todaysDay)){
            group.isToday = true;
            switch1 = false;
          }
          if (switch2 && (+match.Details.substring(0,2) == tomorrowsDay)) {
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
      // console.log("Updated master Group --");
      // console.log(groups);
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
            this.tableGroups.push(group);
        }
        else if (this.viewSelectedDate == 'Tomorrow' && group.isTomorrow) {
            this.tableGroups.push(group);
        }
        else if (this.viewSelectedDate == 'Today & Tomorrow' && (group.isTomorrow || group.isToday) ) {
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
      //find the matches relative to the leagueGroup clicked
        var groupIndex = this.viewTableList.indexOf(rowInfo);
        //Position in viewTableList
        var matchPosition = groupIndex + 1;
        allMatches.forEach( match => {
          //returns integer of date's 'dd'
          var matchDate: number = this.matchDateInteger(match);
          //position in MasterList.
          var matchIndex: number = allMatches.indexOf(match);

          if(match.League != null && match.League.includes(rowInfo.League)){
            if(this.viewSelectedDate == 'Today & Tomorrow' && (matchDate == this.dateEnd || matchDate == this.dateStart) ) {
              this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
              this.viewTableList.splice(matchPosition, 0, match);
              matchPosition++;
            }
            if(this.viewSelectedDate == "Today" && matchDate == this.dateStart) {
              this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
              this.viewTableList.splice(matchPosition, 0 , match);
              matchPosition++;
            }
            if(this.viewSelectedDate == "Tomorrow" && matchDate == this.dateEnd){
              this.setDisplayHeader(match, matchPosition, matchIndex, groupIndex, allMatches);
              this.viewTableList.splice(matchPosition, 0, match);
              matchPosition++;
            }
          }
        });
        this.viewTableList = this.addFixturesDate(this.viewTableList);
      return this.viewTableList
    }

    setDisplayHeader(matchObj,matchPosition, matchIndex, groupIndex, allMatches){
      (matchPosition == (groupIndex +1) || (matchObj.Details.substring(0,2) != allMatches[matchIndex-1].Details.substring(0,2))) ? matchObj.displayHeaderDate = true : matchObj.displayHeaderDate = false;
    }

    removeFromListOnClick(viewTableList, tableGroups, rowInfo): any[] {

        function removedMatches(item) {
          if(tableGroups.includes(item) || item.League != rowInfo.League){ return true; }
        }

        const result = viewTableList.filter(removedMatches);

        this.viewTableList = result;

      return this.viewTableList
    }



    //filter incomplete match records. Cold cause future bug. if initial scrape is postponed. Refresh on client side should solve this...maybe filter this further down the road.
    private sanitizeList(matches: any): any[]{
      function nullMatches(match){
        if(match.League != null && match.BAway != 999 && match.Details != null && match.BAway != 0 && match.SMAway != 0){
          return true;
        }
      }
      const cleanList = matches.filter(nullMatches);
      return cleanList;
    }

    private setStartEndDays(dateSelection: any) {
      var dateValidator: number[] = this.dateHandlingService.returnDateSelection(dateSelection);

      this.dateStart = dateValidator[0];
      this.dateEnd = dateValidator[1];
    }

    //Date formatter
    addFixturesDate(matchList: any[] ): any[]{

      matchList.forEach( matchObj => {

        if(matchObj.Details != undefined){
          if(matchObj.displayHeaderDate){
            //All of Angular is using Datepipes to conver by en-US locale, not en-GB. For the time being, everything must be converted to english Locale
            var convertIntoUS = this.dateHandlingService.switchDaysWithMonths(matchObj.Details);
            matchObj.FixturesDate = this.datepipe.transform(convertIntoUS, 'EEE dd MMM');
            matchObj.FixturesTime = this.datepipe.transform(convertIntoUS, 'HH:mm');
          } else {
            var convertIntoUS = this.dateHandlingService.switchDaysWithMonths(matchObj.Details);
            matchObj.FixturesDate = "";
            matchObj.FixturesTime = this.datepipe.transform(convertIntoUS, 'HH:mm');
          }
        }
      });
      return matchList;
    }

    // return an integer of the date.
    private matchDateInteger(matchObj: any): number {
      return +this.dateHandlingService.convertGBStringDate(matchObj.Details).getMonth()*30 + (this.dateHandlingService.convertGBStringDate(matchObj.Details)).getDate();
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

    openPopUp($event: MatSlideToggleChange, groupItem: any) {

      if($event.checked == false && !this.dialogDisabled){
        //if Turning toggle to "OFF", popup dialog box to warn user.
        let dialogRef =  this.dialog.open(StatusDisableDialogueComponent);

        dialogRef.afterClosed()
          .subscribe( result => {
            //If user selects "Cancel" then they CONTINUE to watch the league's matches. result = false.
            //If user selects "Okay" they DISABLE all notifications for that league. result = true.
            if(result == 'false') {
              $event.source.checked = true;
              //TODO send this groupItem to another method. Notifications Services.
            }
            if(result == 'true') {
              $event.source.checked = false;
              groupItem.ignoreAll = true;
            }
          });
      } else if ($event.checked == true && !this.dialogDisabled) {
        //if toggle is being clicked "ON", turn on Notifications.
        groupItem.ignoreAll = false;
      } else if (this.dialogDisabled) {
        //If user has selected to ignore popups, then set notifications based off $event.checked
          $event.source.checked == true ? groupItem.ignoreAll = false : groupItem.ignoreAll = true;
          console.log("GroupItem: " + groupItem.League + "- ignoreAll: " + groupItem.ignoreAll);

      } else if ($event.checked == false && this.dialogDisabled){
        groupItem.ignoreAll = true;
      }
        this.ignoreAllMatchesToggle(groupItem);
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
      ignoreStatus ? this.matchStatusService.addToIgnoreList(selection) : this.matchStatusService.removeFromIgnoreList(selection);
    }

    addToWatchList(rowData:any){
      rowData.isWatched = !rowData.isWatched;
      this.matchStatusService.watchMatchSubject(rowData);
    }

    saveMasterGroup( masterGroup: any){
      this.matchStatusService.watchGroupSubject( masterGroup );
    }

}

