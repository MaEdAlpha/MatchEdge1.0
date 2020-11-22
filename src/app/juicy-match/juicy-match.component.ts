import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { JuicyMatchHandlingService } from './juicy-match-handling.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { IsJuicyService } from './is-juicy.service';

@Component({
  selector: 'app-juicy-match',
  templateUrl: './juicy-match.component.html',
  styleUrls: ['./juicy-match.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class JuicyMatchComponent implements OnInit, OnChanges {
  @Input() allMatches: any;
  juicyMatches: any[];
  juicyMatchCount: number = 10;
  expandedElement: any | null;
  displayedColumns: string[] = ['AReturn', 'Home', 'Spacer',  'Details', 'Away' , 'HReturn'];
  SecondcolumnsToDisplay: string[] = ['SMHome','BHome', 'BDraw', 'BAway', 'BTTSOdds', 'B25GOdds','SMAway',  'League', 'OccH', 'OccA'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  constructor(private juicyMHService: JuicyMatchHandlingService, private isJuicy: IsJuicyService) { }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.allMatches && changes.allMatches.currentValue) {
      this.juicyMatches = this.juicyMHService.setJuicyMatches(this.allMatches);
    }
  }

  ngOnInit(): void {

  }

  ngDoCheck() {

  }

  check(){
    this.isJuicy.checkMatch(this.allMatches);
    console.log(this.juicyMatches);

  }
}
