import { Component, OnInit, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { DateHandlingService } from '../date-handling.service';
import { MatchStatusService } from '../match-status.service';
import { UserPropertiesService } from '../user-properties.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SidenavService } from '../view-table-sidenav/sidenav.service';
import { Subscription } from 'rxjs';
import { NotificationBoxService } from '../notification-box.service';

interface DateOptions {
  value: string;
  viewValue: string;
}

interface ViewModes {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-top-layer-filters',
  templateUrl: './top-layer-filters.component.html',
  styleUrls: ['./top-layer-filters.component.css']
})
export class TopLayerFiltersComponent implements OnInit, OnChanges {
  displayFixtures: number;
  @Output() hideTable: EventEmitter<number> = new EventEmitter<number>();
  @Output() emitDateSelect: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitIgnoreList: EventEmitter<string[]> = new EventEmitter<string[]>();

  private userClickSubscription: Subscription;

  constructor( private userPref: UserPropertiesService, private matchStatusService: MatchStatusService, private dateHandlingService: DateHandlingService, private notificationService: NotificationBoxService) { }

      //first layer filter
      viewThisDate:string;
      viewThisMode:string = "All";
      tableTitle:string = "Fixtures";

      dateSelect: DateOptions[] = [
        { value: '0' , viewValue: 'Today' },
        { value: '1' , viewValue: 'Tomorrow' },
        { value: '2' , viewValue: 'Today & Tomorrow' }
      ]

      viewModes: ViewModes [] = [
        { value: '0' , viewValue: 'All' },
        { value: '1', viewValue: 'Active Notifications'},
        { value: '2', viewValue: ' Active Bets'},
        { value: '3', viewValue: 'Ignore'}
      ]

  ngOnChanges(changes: SimpleChanges){
    if(changes.viewThisDate.firstChange){
      console.log("Change detected: " + this.viewThisDate);
    }
  }

  ngOnInit(): void {
    this.viewThisDate = this.userPref.getSelectedDate();

    this.userClickSubscription = this.notificationService.getNotificationPing().subscribe( matchObject => {
      console.log("Click registerd in TopFilterComp");

      matchObject.notificationIsActivated ? this.goToThisJuicy() : console.log(matchObject + "returned false");
    })

    //setup an observable to listen for a change  that executes a method to go to Juicy Matches
  }

  ngOnDestroy(){
    this.userClickSubscription.unsubscribe();
  }

  showTable(value:number) {
    this.displayFixtures=value;
    this.hideTable.emit(this.displayFixtures);
  }

  displaySelectedTable(_tableTitle) {
    _tableTitle == "Watchlist" ? this.displayFixtures = 2 : this.displayFixtures = 1;
    this.hideTable.emit(this.displayFixtures);
  }

  //Delete this? not necessary
  sendDateSelection(value: string){
    this.viewThisDate = value;
    // Update UserPref Range value
    // this.userPref.updateRange(value);
    this.dateHandlingService.sendSelectedDate(value);
  }

  toggleTable($event: MatSlideToggleChange){
    $event.checked ? this.tableTitle = "Watchlist" : this.tableTitle = "Fixtures";
    $event.checked ? this.displayFixtures = 2 : this.displayFixtures = 1;
    this.hideTable.emit(this.displayFixtures);
  }
  initIgnoreList(){
    this.emitIgnoreList.emit(this.matchStatusService.getIgnoreList());
  }

  goToThisJuicy(){
    this.hideTable.emit(3);
  }
}

//   modifiedGroupList(data: any[], groupList: any[]) : any[]{
//     groupList.forEach( groupObj => {

//       if(!this.masterList.includes(groupObj)){
//         this.masterList.push(groupObj);
//       }

//       if(groupObj.expanded == true && !groupObj.isActive)
//       {
//         var groupIndex = this.masterList.indexOf(groupObj);
//         var matchPosition = groupIndex + 1;

//         data.forEach(matchObj => {
//           if(matchObj.League == groupObj.League)
//           {
//             var index = matchPosition;
//             this.masterList.splice(index, 0, matchObj);
//             matchPosition ++;
//           }
//         });
//         //set to active to avoid excessive iterations. This will be set back to false, when expanded = false.
//         groupObj.isActive = true;
//       }

//       if (groupObj.expanded == false && groupObj.isActive){
//         data.forEach( match => {
//           if(match.League == groupObj.League){
//             var position = this.masterList.indexOf(match);
//             this.masterList.splice(position, 1);
//           }
//         });
//         groupObj.isActive = false;
//       }
//     })
//     return this.masterList;
//   }
