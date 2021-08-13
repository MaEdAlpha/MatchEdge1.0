import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { AppComponent } from './app.component';

//Components
import { MatchTableComponent } from './match-table/match-table.component';
import { PrivacyContentComponent } from './privacy-content/privacy-content.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

const routes: Routes = [
  // { path: 'settings', component: MatchNotificationSettingsComponent},
  { path: ' ', component: AppComponent},
  { path: 'privacy', component: PrivacyContentComponent },
  { path: 'terms', component: TermsOfUseComponent },
  { path: 'matches', component: MatchTableComponent, canActivate: [AuthGuard] },
  { path: '**', component: AppComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
