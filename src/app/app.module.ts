//Modules
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import localeGB from '@angular/common/locales/en-GB';

//Materials
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule} from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatchNotificationSettingsComponent } from './match-notification-settings/match-notification-settings.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { SettingsComponent } from './user-settings/settings.component';
import { SummaryListComponent } from './summary-list/summary-list.component';
import { TopLayerFiltersComponent } from './top-layer-filters/top-layer-filters.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { ViewTableSidenavComponent } from './view-table-sidenav/view-table-sidenav.component';
import { StatusDisableDialogueComponent } from './status-disable-dialogue/status-disable-dialogue.component';

//Directives
import { FlickerDataDirective } from './directives/flicker-notification.directive';
import { FlickerDataLayDirective } from './directives/flicker-data-lay.directive';
import { FlickerDataEvDirective } from './directives/flicker-data-ev.directive';
import { WatchHomeDirective } from './directives/watch-home.directive';
import { WatchAwayDirective } from './directives/watch-away.directive';
import { BetHomeDirective } from './directives/bet-home.directive';
import { BetAwayDirective } from './directives/bet-away.directive';
import { IgnoreIconDirective } from './directives/ignore-icon.directive';
import { HideTableRowDirective } from './directives/hide-table-row.directive';
import { FlickerDataMatchRatingDirective } from './directives/flicker-data-match-rating.directive';
import { InactiveMatchDirective } from './directives/inactive-match.directive';

//Pipe
import { HeaderDatePipe } from './pipes/hdr.datepipe';
import { TimeDatePipe } from './pipes/time.datepipe';
import { DateHandlingService } from './date-handling.service';
import { MatchStatusService } from './match-status.service';
import { MatSortModule } from '@angular/material/sort';


registerLocaleData(localeGB);

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
    FlickerDataEvDirective,
    WatchHomeDirective,
    WatchAwayDirective,
    BetHomeDirective,
    BetAwayDirective,
    IgnoreIconDirective,
    ViewTableSidenavComponent,
    TopLayerFiltersComponent,
    StatusDisableDialogueComponent,
    HideTableRowDirective,
    FlickerDataMatchRatingDirective,
    HeaderDatePipe,
    TimeDatePipe,
    InactiveMatchDirective
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
    MatDialogModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ToastrModule.forRoot( {
      timeOut: 10000,
      onActivateTick: true,
      tapToDismiss: false,
      enableHtml: true,
      progressBar: true,
      extendedTimeOut: 2000,
      closeButton: true,

      positionClass: 'toast-bottom-right',
      preventDuplicates: false,
    }),
  ],
  providers: [  MatchesService,
                 WebsocketService,
                  UserPropertiesService,
                   MatchDisplayService,
                    MatchNotificationService,
                     CalcSettingsService,
                      IsJuicyService,
                       JuicyMatchHandlingService,
                        DateHandlingService,
                          MatchStatusService,
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
