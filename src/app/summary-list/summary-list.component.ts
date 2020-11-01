import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Match } from '../match/match.model';

@Component({
  selector: 'app-summary-list',
  templateUrl: './summary-list.component.html',
  styleUrls: ['./summary-list.component.css']
})

export class SummaryListComponent implements OnInit {
  isOpened = false;
  @Input() activeMatches: any = [];
  @Input() position: any = [];
  @Output() unWatchEvent = new EventEmitter<Match>();
  clickedSummary: string[] = [];

    ngOnInit() {
      this.initUnWatchButtons(this.activeMatches.length);
      console.log("Init UnWatchButton method called");
    }

    log(match: Match[]) {
      console.log(match);
    }

    unWatchMatch( match: Match, index: number) {
      this.unWatchEvent.emit(match);
      this.clickedSummary[index] = 'false';
      this.activeMatches.splice(index,1);
  }

    initUnWatchButtons(count:number){
      for(var i = 0; i < count; i++){
        this.clickedSummary.push('false');
      }
    }
}
