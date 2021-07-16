import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  @Input() isLoading:boolean;
  constructor() { }

  ngOnChanges(simpleChanges:SimpleChanges){
  }

  ngOnInit(): void {

  }

}
