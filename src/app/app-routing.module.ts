import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Components
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MatchTableComponent } from './match-table/match-table.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'matches', component: MatchTableComponent },
  { path: 'signup', component: SignupComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
