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
  displayMatch: string[] = [];

    ngOnInit() {
      this.initUnWatchButtons(this.activeMatches.length);
    }

    log(match: Match[]) {
      console.log(match);
    }

    unWatchMatch( match: Match, index: number) {
      this.unWatchEvent.emit(match);
      this.displayMatch[index] = 'false';
    }

    summaryListMatchDisplay(index: number) {
      this.displayMatch[index] = 'true';
    }

    initUnWatchButtons(count:number){
      for(var i = 0; i < count; i++){
        this.displayMatch.push('false');
      }
    }
}
