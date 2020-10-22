import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MatchTableComponent } from './match-table/match-table.component';
import { WatchlistComponent } from './watchlist/watchlist.component';

const routes: Routes = [
  { path: 'api/watchlist', component: WatchlistComponent },
  { path: 'api/matches', component: MatchTableComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
