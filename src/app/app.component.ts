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
  toggleSettingsTemplate:boolean;
  profileJson: string= null;
  isAuthenticated: boolean=false;
  isEntryPoint: boolean=true;
  isLoading: boolean = true;
  tabSelection: number;
  userEmail:string;

  constructor(public auth: AuthService, private userPropertiesService: UserPropertiesService, private router: Router, private matchesService: MatchesService) {

  }

  ngOnInit(){
    console.log("Get JWT Token");
    this.tabSelection=0;
    this.userEmail='';
    this.toggleSettingsTemplate = false;
    this.auth.user$.subscribe( (profile) => {
      this.profileJson = JSON.stringify(profile, null, 2);
      this.isAuthenticated = profile != null ?  true : false;
      this.isAuthenticated ? this.getUserSettings(profile.email, profile.sub) : null;
      this.userEmail = profile != null ? profile.email : null;
    });

    this.matchesService.loadPage.subscribe( (isDone) => {
      this.isLoading = isDone;
    });

    this.matchesService.view2Ups.subscribe( (unlock) => {
      this.isEntryPoint= unlock;
    });
  }

  getUserSettings(userEmail: string, sub:string){
    //passes userEmail & AuthO sub
   this.userPropertiesService.getSettings(userEmail, sub);
  }
  //opening user Settings panel
  displayPanel(event: boolean){

    this.toggleSettingsTemplate = event;

  }

  resetSettings(event:{state:boolean, tab:number}){
    console.log("RESET DETECTED!");
    console.log(event);
    this.tabSelection = event.tab;
    this.toggleSettingsTemplate = !event.state;
    setTimeout(()=>{
      this.toggleSettingsTemplate = !this.toggleSettingsTemplate;
    },20)
  }
}
