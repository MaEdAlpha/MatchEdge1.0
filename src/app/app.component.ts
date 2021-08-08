
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { NavigationStart, Router, RouterEvent, RoutesRecognized } from '@angular/router';
import { MatchesService } from './match/matches.service';
import { UserPropertiesService } from './services/user-properties.service';
import { filter } from 'rxjs/operators';

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
  activateDisplaySettings: boolean;
  tabSelection: number;
  userEmail:string;
  isReadingPolicy:boolean = false;
  onEnterSite:boolean = false;

  constructor(public auth: AuthService, private userPropertiesService: UserPropertiesService, private router: Router, private matchesService: MatchesService) {
    this.router.events.pipe(
      filter (
        (event: RouterEvent) => {
          return  (event instanceof NavigationStart );
        }
      )
    )
    .subscribe(
      ( event:NavigationStart ) => {

          /*
            navigationTrigger will be one of:
              imperative (user clicked link)
              popstate (browswer controlled change such as BackButton)
              -hashchange ??? don't know what this is.
          */
         if(event.url == '/privacy'){
           this.isReadingPolicy =true;
           this.getPage();
         } else if (event.url == '/terms'){
           this.isReadingPolicy = true;
          //  this.getPage();
         } else {
           this.isReadingPolicy = false;
         }
          // console.group( "NavigationStart Event");
          // console.log("nagivation id:", event.id);
          // console.log("route:", event.url);
          //  console.log("trigger:", event.navigationTrigger);
          // upon detecting back/forward click. Set entryPoint boolean
          // Need to account for multiple mongoDB connections on backend if user keeps hitting back forward back forward button.
         if(event.restoredState){

           if(event.url == '/'){

             this.isEntryPoint = !this.isEntryPoint;

            }else if (event.url !='/'){

              this.isEntryPoint = false;

            }
          }
       });

      //  //KEEP THIS FUNCTIONALITY TO AVOID ACCESSING LOCALSTORAGE?
      //  this.router.events.pipe(
      //   filter (
      //     (event: RouterEvent) => {
      //       return  (event instanceof NavigationEnd );
      //     }
      //   )
      // )
      // .subscribe(
      //   ( event:NavigationEnd ) => {
      //     console.group( "NavigationEnd Event");
      //     console.log("nagivation id:", event.id);
      //     console.log("Url:", event.url);
      //     console.log("AfterRedirect", event.urlAfterRedirects);


      //      //upon detecting back/forward click. Set entryPoint boolean
      //      //Need to account for multiple mongoDB connections on backend if user keeps hitting back forward back forward button.
      //      if(event.urlAfterRedirects == event.url){
      //        console.log(this.userEmail);
      //        console.log("Retrieving AuthData");
      //        this.userPropertiesService.getAuthData();


      //       //retrieve authData and user Settings from LocalStorage.
      //      }
      //    })

  }

  ngOnInit(){
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

    this.matchesService.viewSubscriptionsPage.subscribe( (selectSubscriptionPage) => {
      //reset parameters, never again setup routes ZALGO.
      this.isEntryPoint = selectSubscriptionPage;
      this.onEnterSite = !this.isEntryPoint;
      this.activateDisplaySettings = !this.isEntryPoint;
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

  onEntryToSite(showDisplaySettings: boolean) {
    console.log("---------------------ENTERING 2UP SITE---------------------");
    console.log("-----------------------------------------------------------");
    this.onEnterSite = true;
    this.activateDisplaySettings = showDisplaySettings;

  }

  getPage(){
    // this.userPropertiesService.getTermsPage();
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
