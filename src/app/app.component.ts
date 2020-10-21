import { Component } from '@angular/core';
import { Match } from './match/match.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MatchEdge';
  storedMatches: Match[] = [];

  onMatchAdded(match){
    this.storedMatches.push(match);
  }
}
