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
  profileJson: string= null;
  isAuthenticated: boolean;

  constructor(public auth: AuthService) {

  }

  ngOnInit(){

    this.auth.user$.subscribe(
      (profile) => {
        (this.profileJson = JSON.stringify(profile, null, 2));
        console.log(this.profileJson);
        this.isAuthenticated = profile != null ?  true : false;
      }
    );
  }


  displayPanel(event: boolean){
    this._displayNotification = event;
  }
}
