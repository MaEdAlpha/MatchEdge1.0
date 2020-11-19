import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//Modules
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

//Materials
import { MatTableModule} from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

//Services
import { MatchesService } from './match/matches.service';
import { WebsocketService } from './websocket.service';

//Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { MatchComponent } from './match/match.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './user-settings/settings.component';
import { SummaryListComponent } from './summary-list/summary-list.component';
import { CalcSettingsComponent } from './calc-settings/calc-settings.component';
import { JuicyMatchComponent } from './juicy-match/juicy-match.component';
import { MatchNotificationSettingsComponent } from './match-notification-settings/match-notification-settings.component';
import { UserPropertiesService } from './user-properties.service';
import { MatchDisplayService } from './match/match-display.service';
import { MatchNotificationService } from './match-notification-settings/match-notification.service';
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { IsJuicyService } from './juicy-match/is-juicy.service';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MatchTableComponent,
    MatchComponent,
    WatchlistComponent,
    LoginComponent,
    SettingsComponent,
    SummaryListComponent,
    CalcSettingsComponent,
    JuicyMatchComponent,
    MatchNotificationSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    HttpClientModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    FormsModule,
    MatCheckboxModule,

  ],
  providers: [MatchesService, WebsocketService, UserPropertiesService, MatchDisplayService, MatchNotificationService, CalcSettingsService, IsJuicyService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
