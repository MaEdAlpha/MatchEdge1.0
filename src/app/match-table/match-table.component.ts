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
    } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]


    ngOnInit() {
      //INIT
      this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
      this.viewSelectedDate = this.userPref.getSelectedDate();
      this.dialogDisabled = this.userPref.getDialogDisabled();
      this.setStartEndDays(this.viewSelectedDate);
      this.ignoreList = [];

      //Subscribe to changes you want upudates on /Matches/Dates/StreamWatch/UserPreferences

      //Changes to match data
      this.matchesSub = this.matchesService.getMatchUpdateListener() //subscribe to matches for any changes.
      .subscribe(( matchData: any) => {
        //Assign each matchData subscribed to the list of objects you inject into html
        this.matches = matchData;

        console.log("--Matches From DB--");
        console.log(this.matches);

        //Takeout bad data
        this.sanitizeList(this.matches);
        // Set your groups up
        this.buildGroupHeaders(this.matches, 0);
        this.cleanGroups(this.masterGroup);
        //set view-table data
        this.dataSource.data = this.masterGroup;
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
        console.log("Start/End UPDATED!!!!");
        // this.dataSource.data = this.getGroupListInit(this.matches, 0,this.groupByColumns);
      })

      //Open WebSocket
      this.webSocketService.openWebSocket();
    }

    ngOnDestroy(){
      this.matchesSub.unsubscribe();
      this.webSocketService.closeWebSocket();
      this.dateSubscription.unsubscribe();
      this.preferenceSubscription.unsubscribe();
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

    //sets a referenceGroupObject
    buildGroupHeaders(matches: any[], level: number){
      //create a group object for each league

      let groups = this.filterGroups(
        matches.map( match => {

            const groupObj = new Group();
            groupObj.level = level + 1;
            for (let i = 0; i <= level; i++) {

              groupObj['League'] = match['League'];
            }
            return groupObj;

      }), JSON.stringify);

      //Assign values to class object

      const leagueName = 'League';
      var todaysDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[0];
      var tomorrowsDay: number = this.dateHandlingService.returnDateSelection('Today & Tomorrow')[1];

      console.log(groups);
      console.log(todaysDay);
      console.log(tomorrowsDay);

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
        const isAsc = "asc";
        return this.compare(a.League, b.League, isAsc);
      });

            //remove null groups
            groups.forEach( (group) => {
              console.log(group.League);
              var position = 0;
              if(group.League == null)
              {
                console.log(group.League + " is null");

                position =  groups.indexOf(group);
                groups.splice(position,1);
              }
              else if(group.isToday == false && group.isTomorrow == false){
                console.log(group.League + " empty");
                position = groups.indexOf(group);
                groups.splice(position,1);
              }
            });

      this.masterGroup = groups
    }

    cleanGroups(groups){
      //remove null groups
      groups.forEach( (group) => {
        console.log(group.League);
        var position = 0;
        if(group.League == null)
        {
          console.log(group.League + " is null");

          position =  groups.indexOf(group);
          groups.splice(position,1);
        }
        else if(group.isToday == false && group.isTomorrow == false){
          console.log(group.League + " empty");
          position = groups.indexOf(group);
          groups.splice(position,1);
        }
      });
    }

    //Study this snippet more. Returns only one unique GroupObject.
    filterGroups(rawGroupList, key){
      const uniqueGroup = {};
      return rawGroupList.filter( groupItem => {
        const groupValue = key(groupItem);
        return uniqueGroup.hasOwnProperty(groupValue) ? false : (uniqueGroup[groupValue] = true);
      });
    }

    displayMatches(row) {
      console.log(row);
        //if row is not expanded, set dataSource to all just the groupLists
      //upon detection of an open league, set the group property to false, and modify groupList to not include matches == row.league
      if (row.expanded) {
        row.expanded = false;
        //TODO this functionality needs to remove all selections relative to row.league from this.dataSource.data.
        this.dataSource.data = this.modifiedGroupList(this.matches, this._allGroup);
      } else {
        //if row is  closed, set to true, and modify groupList.
        //TODO set this group to expanded == true. Set the dataSource via addgroupsNew() function.
        if(!row.ignoreAll)
        {
          row.expanded = true;
          //need to find all items relative to this row.league objectand add it to this.dataSource.data.
          this.dataSource.data = this.modifiedGroupList(this.matches,this._allGroup);
        }

        if(row.ignoreAll){
          this.showToast("enableToggle");
        }
      }

    }
    groupHeaderClick(row) {

      // console.log(row);

      //if row is not expanded, set dataSource to all just the groupLists
      //upon detection of an open league, set the group property to false, and modify groupList to not include matches == row.league
      if (row.expanded) {
        row.expanded = false;
        //TODO this functionality needs to remove all selections relative to row.league from this.dataSource.data.
        this.dataSource.data = this.modifiedGroupList(
          this.matches,
          this._allGroup
          );
      } else {
        //if row is  closed, set to true, and modify groupList.
        //TODO set this group to expanded == true. Set the dataSource via addgroupsNew() function.
        if(!row.ignoreAll)
        {
          row.expanded = true;
          //need to find all items relative to this row.league objectand add it to this.dataSource.data.
          this.dataSource.data = this.modifiedGroupList(
            this.matches,
            this._allGroup
            );
        }

        if(row.ignoreAll){
          this.showToast("enableToggle");
        }
      }
      //console.log("Data Source: ");

      //console.log(this.dataSource.data);
    }


  //What populates View table initially. It returns an array of objects of Group class.
  getGroupListInit(matchList: any[], level: number, groupByColumns: string[]): any[]{
    //create a group object for each league
    let groups = this.uniqueBy(
      matchList.map( matchObj => {
          const result = new Group();
          result.level = level + 1;
          for (let i = 0; i <= level; i++) {
              result[groupByColumns[i]] = matchObj[groupByColumns[i]];
          }
          //console.log(result);
          return result;
      }),
      //Necessary? I understand how it works, but why do it like this?
      JSON.stringify
    );

    const currentColumn = groupByColumns[level];

    groups.forEach(group => {
      //filter all data to matching brands, for each group. add total count to group property
      const rowsInGroup = matchList.filter( matchObj => group[currentColumn] === matchObj[currentColumn] );
         console.log(group);
        // console.log(rowsInGroup);
        var matchDate: number;
        var count = 0;
      rowsInGroup.forEach( (match) => {
        if(count == 0) {
          matchDate = match.Details.substring(0,2);
          group.datesActive.push(+match.Details.substring(0,2));

          count++;
        } else if ( +match.Details.substring(0,2) != +matchDate ){
          matchDate = match.Details.substring(0,2);
          group.datesActive.push(+match.Details.substring(0,2));
        }
      })
      group.totalCounts = rowsInGroup.length;
      console.log(rowsInGroup);
      //this.expandedSubCar = [];
    });

    // sort alphabetically
    groups = groups.sort((a: any, b: any) => {
      const isAsc = "asc";
      return this.compare(a.League, b.League, isAsc);
    });

    var index: number;
    //remove any non-fully scraped data ('league missing')
    groups.forEach(group => {
      if(group.League == null)
      {
        index =  groups.indexOf(group);
        groups.splice(index,1);
      }
      else if(!group.isToday && !group.isTomorrow){
        index = groups.indexOf(group);
        groups.splice(index,1);
      }
    });      //asign groups to _allGroup for calling later on click() expand functionality.

    console.log("Start/End Values: for " + this.viewSelectedDate + " " + this.dateStart + " " + this.dateEnd);

    groups.forEach(group => {
      if( this.viewSelectedDate == 'Today & Tomorrow' && group.datesActive.includes(this.dateStart || this.dateEnd))
      {
        //Do Nothing. Matches exist in this group
          console.log(group.League + " has a match");
      } else if (this.viewSelectedDate == 'Today' && group.datesActive.includes(this.dateStart) ) {
        //Do nothing
        console.log(group.League + " has a match");
      } else if (this.viewSelectedDate == 'Tomorrow' && group.datesActive.includes(this.dateStart)){
        //Do nothing
        console.log(group.League + " has a match");
      } else if (!group.datesActive.includes(this.dateStart || this.dateEnd)) {
        console.log(group.League + " has no active matches!!!!!!!!!!!");
        groups.splice(groups.indexOf(group), 1);
      } else {
        console.log("removed: " + group.League);
        groups.splice(groups.indexOf(group), 1);
      }
    });
    this._allGroup = groups;
    //returns an alphabetically organized group list
    console.log(this._allGroup);

    return groups;
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

    private sanitizeList(matches: any){
      matches.forEach(match => {
        if(match.BAway == 999 || match.League == null ){
          this.removeMatch(match, this.matches);
        }
      });
    }

    private removeMatch(match: any, mainList: any[]) {
      var index: number = mainList.indexOf(match);
      console.log("REMOVED at index: " + index);
      console.log(match);
      mainList.splice(index,1);
    }

    private setStartEndDays(dateSelection: any) {
      var dateValidator: number[] = this.dateHandlingService.returnDateSelection(dateSelection);

      this.dateStart = dateValidator[0];
      this.dateEnd = dateValidator[1];
    }




    //Handles logic for MatTable. It adds and removes match items based off the state of the League Group Header.
    modifiedGroupList(matches: any[], groupList: any[]) : any[]{

      console.log("DateStart: " + this.dateStart + " DateEnd " + this.dateEnd);
      //TODO BUG-FIX WHEN LOCALE_ID WORKS.

      groupList.forEach( groupObj => {
        //add group Object into masterList if not found in this.masterList.
        //FIRST IF
        if(!this.masterList.includes(groupObj) && groupObj.League){
          this.masterList.push(groupObj);
        }
        //for an  expanded group that isActive == true. Iterate over each matchObj and compare date.
        //groupObj is expaned but is not active. =? Remove any matchObject from master list then set Group isActive to true.
        //SECOND
        if(groupObj.expanded == true && !groupObj.isActive)
        {
          var groupIndex = this.masterList.indexOf(groupObj);
          var matchPosition = groupIndex + 1;

          matches.forEach( matchObj => {
            var matchIndex = matches.indexOf(matchObj);
            //Returns correct date format for en-GB
            var matchDate: number = this.matchDateInteger(matchObj);
            //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
            if(matchObj.League == groupObj.League && (matchDate == this.dateEnd || matchDate == this.dateStart && matchObj.BAway != 999))
            {
              if(matchPosition == groupIndex + 1){
                matchObj.displayHeaderDate = true;
              }
              else if (matchObj.Details.substring(0,2) != matches[matchIndex-1].Details.substring(0,2)) {
                //Display new full date  if previous Details are a different date.
                matchObj.displayHeaderDate = true;
              }
              else {
                matchObj.displayHeaderDate = false;
              }
              var index = matchPosition;
              //splice (index, number, obj) == take match object, place it in at index value, 0 means don't replace it, just insert 'matchObj' at 'index'.
              this.masterList.splice(index, 0, matchObj);
              matchPosition ++;
            }
          });
          //set to active to avoid excessive iterations. This will be set back to false, when expanded = false.
          groupObj.isActive = true;
        }

        //REMOVES MATCHES FROM UNDERNEATH GROUP HEADER
        // this cleans up the matches. When you click a groupLeague that is open. It changes to expanded = false. isActive = true.
        if (groupObj.expanded == false && groupObj.isActive){

          matches.forEach( matchObj => {
            var matchDate: number = this.matchDateInteger(matchObj);
            if(matchObj.League == groupObj.League && (matchDate == +this.dateEnd || matchDate == +this.dateStart)){
              var position = this.masterList.indexOf(matchObj);
              //splice == remove an object (defined by 1) at index 'position'
              this.masterList.splice(position, 1);
            }
          });
          groupObj.isActive = false;
        }
      });
      this.masterList = this.addFixturesDate(this.masterList);
      console.log(this.masterList);

      //Remove group headers that do not have any matches.

      return this.masterList;
    }

    addFixturesDate(matchList: any[] ): any[]{

      matchList.forEach( matchObj => {

        //For filtering out GROUP object that does not contain 'Details' Property
        if(matchObj.Details != undefined){
          if(matchObj.displayHeaderDate){
            //All of Angular is using Datepipes to conver by en-US locale, not en-GB. For the time being, everything must be converted to english Locale
            var convertIntoUS = this.dateHandlingService.switchDaysWithMonths(matchObj.Details);
            matchObj.FixturesDate = this.datepipe.transform(convertIntoUS, 'EEE dd MMM');
            matchObj.FixturesTime = this.datepipe.transform(convertIntoUS, 'HH:mm');
          }else {

            var convertIntoUS = this.dateHandlingService.switchDaysWithMonths(matchObj.Details);
            matchObj.FixturesDate = "";
            matchObj.FixturesTime = this.datepipe.transform(convertIntoUS, 'HH:mm');
          }
        }
      });
      return matchList;
    }
    //Takes selected date and updates in match-TableComponent.
    updateFixtures() {
      console.log(this.masterList);
      var groupWithStates : any[] = [];
      // Case if user just toggles dates without expanding any leagues.
      if(this.masterList.length == 0){
        this.dataSource.data = this.getGroupListInit(this.matches, 0,this.groupByColumns);
        //case where group(s) are expaned.
      }  else  {
        // gets all groups with current state.
        this.masterList.forEach( obj => {
          if(obj.level == 1){
           if( obj.datesActive.includes(this.dateEnd || this.dateStart) ){
             console.log(obj);
             console.log("put me in a new list");
             groupWithStates.push(obj);
            }
          }
        });
        //Clears all matches in lists, leaves only Group WITH their active states.
        this.dataSource.data = this.showUpdatedView(this.matches, groupWithStates);
      }
    }

    //Returns an updated list of matches Using Date selection
    showUpdatedView(allMatchData: any[], groupWithStates: any[]): any[] {
      this.masterList = [];

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
            var matchDate: number = this.matchDateInteger(matchObj);
            //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
            if(matchObj.League == groupHeader.League && matchDate == this.dateEnd  && matchDate == this.dateStart && matchObj.BAway != 999)
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

    private matchDateInteger(matchObj: any): number {
      return +this.dateHandlingService.convertGBStringDate(matchObj.Details).getMonth()*30 + (this.dateHandlingService.convertGBStringDate(matchObj.Details)).getDate();
    }


    openAllGroups(){
      this._allGroup.forEach(element => {
        element.expanded = true;
      });
      console.log(this._allGroup);
    }


    // addGroupsNew(
    //   allGroup: any[],
    //   data: any[],
    //   groupByColumns: string[],
    //   dataRow: any
    //   ): any[] {
    //   return this.getSublevelNew(allGroup, data, 0, groupByColumns, dataRow);
    // }

    //returns subGroup()
    // getSublevelNew(
    //   allGroup: any[],
    //   data: any[],
    //   level: number,
    //   groupByColumns: string[],
    //   dataRow: any
    // ): any[] {

    //   if (level >= groupByColumns.length) {
    //     //returns all matches without group separator.
    //     return data;
    //   }

    //   const currentColumn = groupByColumns[level];
    //   let subGroups = [];
    //   //console.log(allGroup);
    //   allGroup.forEach(group => {
    //     //Set a constant rowsInGroup, where each match selection and your group.league are the same
    //       const rowsInGroup = data.filter(
    //       row => group[currentColumn] === row[currentColumn]
    //     );
    //       // console.log(group[currentColumn]);
    //     console.log("rowsInGroup");

    //     console.log(rowsInGroup);

    //     group.totalCounts = rowsInGroup.length;

    //     if (group.League == dataRow.League.toString()) {
    //       group.expanded = dataRow.expanded;
    //       const subGroup = this.getSublevelNew(
    //         allGroup,
    //         rowsInGroup,
    //         level + 1,
    //         groupByColumns,
    //         dataRow.League.toString()
    //       );

    //       this.expandedSubCar = subGroup;
    //       subGroup.unshift(group);
    //       subGroups = subGroups.concat(subGroup);

    //     } else {
    //       subGroups = subGroups.concat(group);
    //     }
    //   });
    //   return subGroups;
    // }

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
          })

          if(this.isNotInList || this.matches.length == 0)
          {
            console.log("not in list");
            console.log(streamMatch);
            this.isNotInList=false;
          }
        })
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
        //close group
        this.groupHeaderClick(row);
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
      if(ignoreStatus == true)
      {
        this.matchStatusService.addToIgnoreList(selection);
      } else {
        this.matchStatusService.removeFromIgnoreList(selection);
      }
    }

    addToWatchList(rowData:any){
      rowData.isWatched = !rowData.isWatched;
      this.matchStatusService.watchMatchSubject(rowData);
    }

}

