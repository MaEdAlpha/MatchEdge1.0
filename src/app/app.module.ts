//Modules
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Materials
import { MatTableModule} from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

//Services
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { IsJuicyService } from './juicy-match/is-juicy.service';
import { JuicyMatchHandlingService } from './juicy-match/juicy-match-handling.service';
import { MatchDisplayService } from './match/match-display.service';
import { MatchesService } from './match/matches.service';
import { MatchNotificationService } from './match-notification-settings/match-notification.service';
import { UserPropertiesService } from './user-properties.service';
import { WebsocketService } from './websocket.service';

//Components
import { AppComponent } from './app.component';
import { CalcSettingsComponent } from './calc-settings/calc-settings.component';
import { HeaderComponent } from './header/header.component';
import { JuicyMatchComponent } from './juicy-match/juicy-match.component';
import { LoginComponent } from './login/login.component';
import { MatchComponent } from './match/match.component';
import { MatchNotificationSettingsComponent } from './match-notification-settings/match-notification-settings.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { SettingsComponent } from './user-settings/settings.component';
import { SummaryListComponent } from './summary-list/summary-list.component';
import { WatchlistComponent } from './watchlist/watchlist.component';

//Directives
import { FlickerDataDirective } from './directives/flicker-notification.directive';
import { FlickerDataLayDirective } from './directives/flicker-data-lay.directive';
import { FlickerDataEvDirective } from './directives/flicker-data-ev.directive';

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
    FlickerDataDirective,
    FlickerDataLayDirective,
    FlickerDataEvDirective
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule,
  ],
  providers: [MatchesService, WebsocketService, UserPropertiesService, MatchDisplayService, MatchNotificationService, CalcSettingsService, IsJuicyService, JuicyMatchHandlingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
