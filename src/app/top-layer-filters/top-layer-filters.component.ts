import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { SidenavService } from '../view-table-sidenav/sidenav.service';

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
export class TopLayerFiltersComponent implements OnInit {
  displayFixtures: number;
  @Output() hideTable: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

      //first layer filter
      viewThisDate:string = "Today & Tomorrow";
      viewThisMode:string = "All";

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
  ngOnInit(): void {
  }

  showFixtures(value:number) {
    this.displayFixtures=value;
    this.hideTable.emit(this.displayFixtures);
  }
}
