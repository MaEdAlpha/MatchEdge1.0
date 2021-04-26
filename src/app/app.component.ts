import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Subscription } from 'rxjs';
import { Match } from './match/match.model';
import { MatchesService } from './match/matches.service';
import { SavedActiveBetsService } from './services/saved-active-bets.service';
import { UserPropertiesService } from './services/user-properties.service';

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

  constructor(public auth: AuthService, private userPropertiesService: UserPropertiesService) {

  }

  ngOnInit(){

    this.auth.user$.subscribe(
      (profile) => {
        (this.profileJson = JSON.stringify(profile, null, 2));
        console.log(this.profileJson);
        this.isAuthenticated = profile != null ?  true : false;
        /*access our database
          - send a request to find user credentials and return user settings.
          - if the email in the profile does not exist, create a new UserSettings Model with
          -
        */
        this.isAuthenticated ? this.getUserSettings(profile.email) : '';
      }
    );
  }

  getUserSettings(userEmail: string):void {
    console.log("Going to service: " + userEmail);

    this.userPropertiesService.getSettings(userEmail);
  }
  displayPanel(event: boolean){
    this._displayNotification = event;
  }
}
