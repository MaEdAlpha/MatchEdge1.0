import {Component, OnDestroy, OnInit, ViewChild, Input , OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatchesService } from '../match/matches.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { WebsocketService } from '../websocket.service';
import { Match } from '../match/match.model';

  export class Group {
    level = 0;
    expanded = false;
    totalCounts = 0;
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
  })

  export class MatchTableComponent implements OnInit, OnDestroy, AfterViewInit {

    displayedColumns: string[] = ['HStatus','BHome','SMHome', 'OccH', 'Home',  'Details', 'Away', 'OccA' , 'BAway','SMAway', 'AStatus'];
    SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
    columnsToDisplay: string[] = this.displayedColumns.slice();
    @Input() matches: any;
    matchStream: any;
    expandedElement: any[] | null;
    retrieveMatches = false;
    tableCount: any;
    matchWatched: string[] = [];
    indexPositions: number[];
    displayHidden: boolean = true;
    isTableHidden: boolean = false;
    isNotInList: boolean = false;
    panelOpenState = false;

    //HeaderGroup Test
    dataSource = new MatTableDataSource<any | Group>([]);
    groupByColumns: string[]=["League"];
    allData: Match[];
    _allGroup: any[];
    columns: any[];

    expandedCar: any[] = [];
    expandedSubCar: any[] = [];

    @ViewChild(MatTable) table: MatTable<any>;


    private matchesSub: Subscription;

    constructor(private matchesService: MatchesService, private webSocketService: WebsocketService ) {
      this.columns = [
        { field: "HStatus" },
        { field: "BHome" },
        { field: "SMHome" },
        { field: "OccH" },
        { field: "Home" },
        { field: "Details" },
        { field: "Away" },
        { field: "OccA" },
        { field: "BAway" },
        { field: "SMAway" },
        { field: "AStatus" }
      ];
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

            //assign groupList to matDataSource
            this.dataSource.data = this.getGroupList(this.allData, 0,this.groupByColumns);
        });

        //Subscribe to Event listener in matches Service for StreamChange data. Update this.matches.
        this.matchesService.streamDataUpdate
        .subscribe( (streamObj) => {
          console.log("recieved in MT comp streamUpdate subscribe");

          var indexOfmatch = this.matches.findIndex( match => match.Home == streamObj.HomeTeamName && match.Away == streamObj.AwayTeamName);
          indexOfmatch != undefined && this.matches[indexOfmatch] ? this.updateMatch(this.matches[indexOfmatch], streamObj) : console.log("not found");
        });
      }

      ngAfterViewInit(){
             //Open Socket Connection
             this.webSocketService.openWebSocket();
      }

      ngOnDestroy(){
       this.matchesSub.unsubscribe();
       this.webSocketService.closeWebSocket();
      }
      groupHeaderClick(row) {
        //if row is not expanded, set dataSource to all just the groupLists
        console.log(row);

        if (row.expanded) {
          row.expanded = false;
          //defaults back to just the groups list with no individual matches being displayed.
          this.dataSource.data = this.getGroupList(
            this.allData,
            0,
            this.groupByColumns
          );

          //you want to remove all matches with row.league from dataSource.data.
        } else {
          //set this group to expanded == true. Set the dataSource via addgroupsNew() function.
          row.expanded = true;
          this.expandedCar = row;
          this.dataSource.data = this.addGroupsNew(
            this._allGroup,
            this.allData,
            this.groupByColumns,
            row
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

      //originally, returns just a list of groups.
      getGroupList(data: any[], level: number, groupByColumns: string[]): any[]{
        //create a group object for each league
        let groups = this.uniqueBy(
          data.map(row => {
            const result = new Group();
            result.level = level + 1;
            for (let i = 0; i <= level; i++) {
              result[groupByColumns[i]] = row[groupByColumns[i]];
              //result[League] = row[groupByColumns[i]];
              //console.log("League: " + result[groupByColumns[i]] + " Home Team: " + row['Home']);
            }
            //console.log(result);
            return result;
          }),
          JSON.stringify
        );
        //console.log(groups);

        const currentColumn = groupByColumns[level];

        groups.forEach(group => {
          //filter all data to matching brands, for each group. add total count to group property
          const rowsInGroup = data.filter(
            row => group[currentColumn] === row[currentColumn]
          );
            console.log(group);
            console.log(rowsInGroup);

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
        console.log(this._allGroup);
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

      setTableHidden(valueEmitted: boolean){
        this.isTableHidden = valueEmitted;
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

    dateSelection(){

    }

  }

