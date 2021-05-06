import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
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
  _displayNotification:boolean = false;
  profileJson: string= null;
  isAuthenticated: boolean=false;
  isLoading: boolean = true;

  constructor(public auth: AuthService, private userPropertiesService: UserPropertiesService, private router: Router, private matchesService: MatchesService) {

  }

  ngOnInit(){
    console.log("Init token + redirect");

    this.auth.user$.subscribe( (profile) => {
      this.profileJson = JSON.stringify(profile, null, 2);
      this.isAuthenticated = profile != null ?  true : false;
      this.isAuthenticated ? this.getUserSettings(profile.email, profile.sub) : null;
    });

    this.matchesService.loadPage.subscribe( (isDone) => {
      this.isLoading = isDone;
    })
  }

  getUserSettings(userEmail: string, sub:string){
    //unecessary callback on response, was used for loading.
     let promise: Promise<boolean> = this.userPropertiesService.getSettings(userEmail, sub);
     promise.then(cb => { console.log(cb);
     });

  }
  //opening user Settings panel
  displayPanel(event: boolean){
    this._displayNotification = event;

  }
}
