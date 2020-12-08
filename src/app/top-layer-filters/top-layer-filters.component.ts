import { Component, OnInit, EventEmitter, Output } from '@angular/core';

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
  isTableHidden: boolean = false;
  @Output() hideTable: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  toggle() {
    this.isTableHidden=!this.isTableHidden
    this.hideTable.emit(this.isTableHidden);

  }

}
