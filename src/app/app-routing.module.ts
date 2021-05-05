import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

//Components
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MatchNotificationSettingsComponent } from './match-notification-settings/match-notification-settings.component';
import { MatchTableComponent } from './match-table/match-table.component';

const routes: Routes = [
  // { path: ' ', component: LandingPageComponent, pathMatch:'full',},
  // { path: 'settings', component: MatchNotificationSettingsComponent},
  { path: 'matches', component: MatchTableComponent, canActivate: [AuthGuard] },

];


@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
