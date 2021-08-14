//Modules
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastContainerModule, ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth-interceptor';

//Auth0
import { AuthModule } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment.prod';
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
import { MatTabsModule } from '@angular/material/tabs';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

//Services
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { IsJuicyService } from './juicy-match/is-juicy.service';
import { JuicyMatchHandlingService } from './juicy-match/juicy-match-handling.service';
import { MatchDisplayService } from './match/match-display.service';
import { MatchesService } from './match/matches.service';
import { MatchNotificationService } from './services/match-notification.service';
import { UserPropertiesService } from './services/user-properties.service';
import { WebsocketService } from './websocket.service';

//Components
import { AppComponent } from './app.component';
import { CalcSettingsComponent } from './calc-settings/calc-settings.component';
import { HeaderComponent } from './header/header.component';
import { JuicyMatchComponent } from './juicy-match/juicy-match.component';
import { LoginComponent } from './auth/login/login.component';
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
import { SignupComponent } from './auth/signup/signup.component';
import { AuthLoginButtonComponent } from './auth/auth-login-button/auth-login-button.component';
import { AuthSignupButtonComponent } from './auth/auth-signup-button/auth-signup-button.component';
import { AuthLogoutButtonComponent } from './auth/auth-logout-button/auth-logout-button.component';
import { AuthenticationButtonComponent } from './auth/authentication-button/authentication-button.component';
import { AuthNavComponent } from './auth/auth-nav/auth-nav.component';

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
import { CompareFilterSettingsDirective } from './directives/compare-filter-settings.directive';
import { TouchItDirective } from './directives/touch-it.directive';

//Pipe
import { HeaderDatePipe } from './pipes/hdr.datepipe';
import { TimeDatePipe } from './pipes/time.datepipe';
import { DateHandlingService } from './services/date-handling.service';
import { MatchStatusService } from './services/match-status.service';
import { MatSortModule } from '@angular/material/sort';
import { PopupViewSavedBetsComponent } from './popup-view-saved-bets/popup-view-saved-bets.component';
import { PopupFormSavedBetsComponent } from './popup-form-saved-bets/popup-form-saved-bets.component';
import { ActiveBetsComponent } from './active-bets/active-bets.component';
import { CustomToastComponent } from './custom-toast/custom-toast.component';
import { FilterSettingsComponent } from './filter-settings/filter-settings.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoadingComponent } from './loading/loading.component';
import { AboutComponent } from './about/about.component';
import { ToastRecordBetComponent } from './toast-record-bet/toast-record-bet.component';
import { SABToastDeleteComponent } from './sabtoast-delete/sabtoast-delete.component';
import { SABToastSaveComponent } from './sabtoast-save/sabtoast-save.component';
import { SABToastUpdatedComponent } from './sabtoast-updated/sabtoast-updated.component';
import { StreamNotificationsComponent } from './stream-notifications/stream-notifications.component';
import { SettledBetDirective } from './directives/settled-bet.directive';
import { SabtoastSettledComponent } from './sabtoast-settled/sabtoast-settled.component';
import { SABToastIncompleteComponent } from './sabtoast-incomplete/sabtoast-incomplete.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { FooterComponent } from './footer/footer.component';
import { PopupAboutUsComponent } from './popup-about-us/popup-about-us.component';
import { PopupContactUsComponent } from './popup-contact-us/popup-contact-us.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { PrivacyContentComponent } from './privacy-content/privacy-content.component';
import { PopupDataProtectionRegulationComponent } from './popup-data-protection-regulation/popup-data-protection-regulation.component';
import { PopupCookiePolicyComponent } from './popup-cookie-policy/popup-cookie-policy.component';
import { PopupTwoUpProductComponent } from './popup-two-up-product/popup-two-up-product.component';
import { PopupSubscribeComponent } from './popup-subscribe/popup-subscribe.component';
import { PopupManageBillingComponent } from './popup-manage-billing/popup-manage-billing.component';
import { ProductFeaturesComponent } from './product-features/product-features.component';
import { PopupQuickReferenceGuideComponent } from './popup-quick-reference-guide/popup-quick-reference-guide.component';
import { PopupLoginMessageComponent } from './popup-login-message/popup-login-message.component';
import { PopupConfirmCancellationComponent } from './popup-confirm-cancellation/popup-confirm-cancellation.component';
import { TwoUpProductFeaturesComponent } from './two-up-product-features/two-up-product-features.component';
import { PopupFixturesMapComponent } from './popup-fixtures-map/popup-fixtures-map.component';



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
    InactiveMatchDirective,
    PopupViewSavedBetsComponent,
    PopupFormSavedBetsComponent,
    ActiveBetsComponent,
    CompareFilterSettingsDirective,
    TouchItDirective,
    CustomToastComponent,
    FilterSettingsComponent,
    AccountSettingsComponent,
    SignupComponent,
    AuthLoginButtonComponent,
    AuthSignupButtonComponent,
    AuthLogoutButtonComponent,
    AuthenticationButtonComponent,
    AuthNavComponent,
    LandingPageComponent,
    LoadingComponent,
    AboutComponent,
    ToastRecordBetComponent,
    SABToastDeleteComponent,
    SABToastSaveComponent,
    SABToastUpdatedComponent,
    StreamNotificationsComponent,
    SettledBetDirective,
    SabtoastSettledComponent,
    SABToastIncompleteComponent,
    SubscriptionsComponent,
    FooterComponent,
    PopupAboutUsComponent,
    PopupContactUsComponent,
    TermsOfUseComponent,
    PrivacyContentComponent,
    PopupDataProtectionRegulationComponent,
    PopupCookiePolicyComponent,
    PopupTwoUpProductComponent,
    PopupSubscribeComponent,
    PopupManageBillingComponent,
    ProductFeaturesComponent,
    PopupQuickReferenceGuideComponent,
    PopupLoginMessageComponent,
    PopupConfirmCancellationComponent,
    TwoUpProductFeaturesComponent,
    PopupFixturesMapComponent,
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
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule,
    AuthModule.forRoot({
      ...env.auth,
       // Request this scope at user authentication time
      httpInterceptor: {
        allowedList: [
                      '${env.serverUrl}'
                     ],
      }
    }),
    ToastrModule.forRoot( {maxOpened: 11 ,
                          preventDuplicates: true}),
    ToastContainerModule,
  ],
  entryComponents: [ CustomToastComponent, SABToastDeleteComponent, SABToastSaveComponent, SABToastUpdatedComponent, SABToastIncompleteComponent ],
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
                          {
                            //Injecting authToken into req.headers, nee to provide an injectable
                            provide: HTTP_INTERCEPTORS,
                            useClass: AuthInterceptor,
                            multi: true,
                          }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
