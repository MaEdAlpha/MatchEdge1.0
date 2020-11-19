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
  _displayNotification:boolean;

  onMatchAdded(match){
    this.storedMatches.push(match);
  }

  displayPanel(event: boolean){
    console.log("Settings Clicked "+ event);
    this._displayNotification = event;
  }
}
