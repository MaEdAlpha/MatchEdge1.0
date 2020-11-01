import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Components
import { LoginComponent } from './login/login.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { SettingsComponent } from './user-settings/settings.component';
import { WatchlistComponent } from './watchlist/watchlist.component';

const routes: Routes = [
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'matches', component: MatchTableComponent },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
