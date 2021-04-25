import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription } from 'rxjs';
import { Match } from './match/match.model';
import { MatchesService } from './match/matches.service';
import { SavedActiveBetsService } from './services/saved-active-bets.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JuicyBets';
  storedMatches: any;
  _displayNotification:boolean;


  constructor(public auth: AuthService) {

  }

  ngOnInit(){

  }

  onMatchAdded(){

  }

  displayPanel(event: boolean){
    this._displayNotification = event;
  }
}
