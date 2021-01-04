import {Component, OnDestroy, OnInit, ViewChild, Input , OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
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
import { NgSwitchCase } from '@angular/common';
import { NumberInput } from '@angular/cdk/coercion';
import { DatePipe } from '@angular/common';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { UserPropertiesService } from '../user-properties.service';

  export class Group {
    level = 0;
    expanded = false;
    isActive = false;
    totalCounts = 0;
    notificationsDisabled = false;
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

  export class MatchTableComponent implements OnInit, OnDestroy, AfterViewInit {

    displayedColumns: string[] = ['HStatus','BHome','SMHome', 'OccH', 'Home',  'FixturesDate', 'Away', 'OccA' , 'BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    @Input() matches: any;
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
    allData: Match[];
    _allGroup: any[];
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
    dialogDisabled: boolean = false;
    displayHeaderDate: boolean = true;

    @ViewChild(MatTable) table: MatTable<any>;


    private matchesSub: Subscription;

    constructor(private userPref: UserPropertiesService, public datepipe: DatePipe, private sidenav: SidenavService , private matchesService: MatchesService, private webSocketService: WebsocketService, public dialog: MatDialog, private notificationBox: NotificationBoxService) {
     } //creates an instance of matchesService. Need to add this in app.module.ts providers:[]


      ngOnInit() {
        //access matches services and gets all matches from DB
        this.matches = this.matchesService.getMatches(); //fetches matches from matchesService
        // Subscribes to the observable that was created when calling the getMatches().
        this.matchesSub = this.matchesService.getMatchUpdateListener() //subscribe to matches for any changes.
        .subscribe(
          (matchData: any) => {
          //Assign each matchData subscribed to the list of objects you inject into html
            this.matches = matchData;
            this.allData = matchData;
            //console.log(this.allData);

            //assign groupList to matDataSource. Should have both Group & matches, organized alphabetically
            this.dataSource.data = this.getGroupListInit(this.allData, 0,this.groupByColumns);

          });

          //Subscribe to Event listener in matches Service for StreamChange data. Update this.matches.
          this.matchesService.streamDataUpdate
          .subscribe( (streamObj) => {
            var indexOfmatch = this.matches.findIndex( match => match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName);
            indexOfmatch != undefined && this.matches[indexOfmatch] ? this.updateMatch(this.matches[indexOfmatch], streamObj) : console.log("not found");
          });

          this.viewSelectedDate = this.userPref.getSelectedDate();
        }

        ngAfterViewInit(){
          //Open Socket Connection
          this.webSocketService.openWebSocket();
          console.log(this.dataSource.data);
      }

      ngOnDestroy(){
       this.matchesSub.unsubscribe();
       this.webSocketService.closeWebSocket();
      }

      convertStringToDate(usDateFormat: string): Date {
        return new Date(Date.parse(usDateFormat));
      }

      //Handles logic for MatTable. It adds and removes match items based off the state of the League Group Header.
      modifiedGroupList(allData: any[], groupList: any[], viewSelection: string) : any[]{

        var dateValidator: number[] = this.dateSelection(viewSelection);

        var dateStart: number = dateValidator[1];
        var dateEnd: number = dateValidator[0];
        console.log("DateStart: " + dateStart + " DateEnd " + dateEnd);
        //TODO BUG-FIX WHEN LOCALE_ID WORKS.
        var matchDate= this.convertStringToDate(this.fuckYouDatePipeMethod(allData[2].Details));

        groupList.forEach( groupObj => {
          //add group Object into masterList if not found in this.masterList.
          //FIRST IF
          if(!this.masterList.includes(groupObj)){
            this.masterList.push(groupObj);
          }
          //for an  expanded group that isActive == true. Iterate over each matchObj and compare date.
          //groupObj is expaned but is not active. =? Remove any matchObject from master list then set Group isActive to true.
          //SECOND
          if(groupObj.expanded == true && !groupObj.isActive)
          {

            var groupIndex = this.masterList.indexOf(groupObj);
            var matchPosition = groupIndex + 1;

            allData.forEach( matchObj => {
              var matchIndex = allData.indexOf(matchObj);
              //Returns correct date format for en-GB
              var matchDate: number = Number((this.convertStringToDate(this.fuckYouDatePipeMethod(matchObj.Details))).getDate());
              //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
              if(matchObj.League == groupObj.League && matchDate <= dateEnd && matchDate > dateStart)
              {
                if(matchPosition == groupIndex + 1){
                  matchObj.displayHeaderDate = true;
                }
                else if (matchObj.Details.substring(0,2) != allData[matchIndex-1].Details.substring(0,2)) {
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
            //set to active to avoid excessive iterations. This will be set back to false, when expanded = false.
            groupObj.isActive = true;
          }

          //REMOVES MATCHES FROM UNDERNEATH GROUP HEADER
          // this cleans up the matches. When you click a groupLeague that is open. It changes to expanded = false. isActive = true.
          if (groupObj.expanded == false && groupObj.isActive){

            allData.forEach( matchObj => {
              var matchDate: number = Number((this.convertStringToDate(this.fuckYouDatePipeMethod(matchObj.Details))).getDate());

              if(matchObj.League == groupObj.League && matchDate <= dateEnd && matchDate > dateStart ){
                var position = this.masterList.indexOf(matchObj);
                //splice == remove an object (defined by 1) at index 'position'
                this.masterList.splice(position, 1);
              }
            });
            groupObj.isActive = false;
          }
        });
        this.masterList = this.addFixturesDate(this.masterList);

        return this.masterList;
      }

      addFixturesDate(matchList: any[] ): any[]{

        matchList.forEach( matchObj => {
          //TODO BUG-FIX WHEN LOCALE_ID WORKS.
          if(matchObj.displayHeaderDate){

            var fuckYouDatePipe = this.fuckYouDatePipeMethod(matchObj.Details);
            matchObj.FixturesDate = this.datepipe.transform(fuckYouDatePipe, 'EEE dd MMM \n  HH:mm');
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
          this.dataSource.data = this.getGroupListInit(this.allData, 0,this.groupByColumns);
          //case where group(s) are expaned.
        }  else  {
          //gets all groups with current state.
          this.masterList.forEach( obj => {
            if(obj.level ==1 ){
              console.log(obj);
              console.log("put me in a new list");
              groupWithStates.push(obj);
            }
          });
          this.dataSource.data = this.showUpdatedView(this.allData, groupWithStates, this.viewSelectedDate);
          //Clears all matches in lists, leaves only Group WITH their active states.
        }


        /*
        Behaviour:
          - If league Group is expanded and isActive  are both true. It does not delete the currently selected matches related to that Group Cell

          - Example: you have Tomrorrow selected and Premier League opened showing tomorrow's matches and you change the selected date to Today.
            When you go to close the group it populates Today's matches AND does nothing to Tomorrow's matches (still showing beneath Premier Leauge
              cell.
          - Inteded Behavior: While showing Today's Matches for Premier League. If I change selected date to 'Tomorrow'
              1. ALL of Today's Matches delete from masterList.
              2. ALL of Tomorrow's Matches populate masterList.


        Solution:
        1. Delete all matches from masterList AND Preserve the current Group objects and their states in masterList.
        2. rerun modifiedGroupList with the updated viewSelected Dates.
        */
        // this.dataSource.data = this.modifiedGroupList(this.allData, this._allGroup, this.viewSelectedDate);
      }

      //Returns an updated list of matches
      showUpdatedView(allMatchData: any[], groupWithStates: any[], dateOption: string): any[] {
        this.masterList = [];
        var dateValidator: number[] = this.dateSelection(dateOption);
        var dateStart: number = dateValidator[1];
        var dateEnd: number = dateValidator[0];

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
              var matchDate: number = Number((this.convertStringToDate(this.fuckYouDatePipeMethod(matchObj.Details))).getDate());
              //INJECTS  MATCHES  UNDERNEATH GROUP HEADER
              if(matchObj.League == groupHeader.League && matchDate <= dateEnd && matchDate > dateStart)
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

      groupHeaderClick(row) {
        //if row is not expanded, set dataSource to all just the groupLists
        //console.log(row);
        //upon detection of an open league, set the group property to false, and modify groupList to not include matches == row.league
        if (row.expanded) {
          row.expanded = false;
          //TODO this functionality needs to remove all selections relative to row.league from this.dataSource.data.
          this.dataSource.data = this.modifiedGroupList(
            this.allData,
            this._allGroup,
            this.viewSelectedDate
            );
        } else {
          //if row is  closed, set to true, and modify groupList.
          //TODO set this group to expanded == true. Set the dataSource via addgroupsNew() function.
          row.expanded = true;
          //need to find all items relative to this row.league objectand add it to this.dataSource.data.
          this.dataSource.data = this.modifiedGroupList(
            this.allData,
            this._allGroup,
            this.viewSelectedDate
            );
        }
        //console.log("Data Source: ");
        //console.log(this.dataSource.data);
      }

      openAllGroups(){
        this._allGroup.forEach(element => {
          element.expanded = true;
        });
        console.log(this._allGroup);
      }

      //What populates View table initially. It returns an array of objects of Group class.
      getGroupListInit(data: any[], level: number, groupByColumns: string[]): any[]{
        //create a group object for each league
        let groups = this.uniqueBy(
          data.map(row => {
            const result = new Group();
            result.level = level + 1;
            for (let i = 0; i <= level; i++) {
              result[groupByColumns[i]] = row[groupByColumns[i]];
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
        console.log(groups);

        const currentColumn = groupByColumns[level];

        groups.forEach(group => {
          //filter all data to matching brands, for each group. add total count to group property
          const rowsInGroup = data.filter( row => group[currentColumn] === row[currentColumn] );
            // console.log(group);
            // console.log(rowsInGroup);

          group.totalCounts = rowsInGroup.length;
          //this.expandedSubCar = [];
        });

        // sort alphabetically
        groups = groups.sort((a: any, b: any) => {
          const isAsc = "asc";
          return this.compare(a.League, b.League, isAsc);
        });

        //asign groups to _allGroup for calling later on click() expand functionality.
        this._allGroup = groups;
        //returns an alphabetically organized group list
        //console.log(this._allGroup);
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

      collapseGroup(row:any)
      {
        if(row.expanded == true)
        {
          //close group
          this.groupHeaderClick(row);
        }

      }

      watchStatus(status: boolean){
        status = !status;
        console.log(status);
        //Send to service to notificationServices.
        //pass the object forward to a notification list. which will then do the thing
        //i.e directive attributes for styling
        //actvate notifications
      }

      betStatus(status: boolean){
        status = !status;
        console.log(status);
      }

      ignoreStatus(status: boolean){
        status = !status;
        console.log(status);
      }

      dateSelection(dateSelected:string): number[]{

        if(dateSelected == 'Today')
        {
          return [1,0];
        }
        if(dateSelected == 'Tomorrow')
        {
          return [2,1];
        }
        if(dateSelected == 'Today & Tomorrow')
        {
          return [2,0];
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
                groupItem.notificationsDisabled = result;
              }

            });
        } else if ($event.checked == true && !this.dialogDisabled) {
          //if toggle is being clicked "ON", turn on Notifications.
          groupItem.notificationsDisabled = false;

        } else if (this.dialogDisabled) {
          //If user has selected to ignore popups, then set notifications based off $event.checked
            $event.source.checked == true ? groupItem.notificationsDisabled = false : groupItem.notificationsDisabled = true;
        }
      }

      showToast(){
        this.notificationBox.showNotification();
      }

      toggleSideNav(){
        this.sidenav.toggle();
      }
        //TODO BUG-FIX WHEN LOCALE_ID WORKS.
        //Re-arranges en-US format MM/DD into DD/MM
      fuckYouDatePipeMethod(dateString: string):string {
        return dateString.slice(3,6) + dateString.slice(0, 3) + dateString.slice(6, 19);
      }
}


