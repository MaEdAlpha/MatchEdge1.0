import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//imports
import { AppRoutingModule } from './app-routing.module';
import { MatTableModule} from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';

//imports
import { HeaderComponent } from './header/header.component';
import { AppComponent } from './app.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { MatchComponent } from './match/match.component';
import { MatchesService } from './match/matches.service';
import { MatIconModule } from '@angular/material/icon';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { MatExpansionModule } from '@angular/material/expansion';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MatchTableComponent,
    MatchComponent,
    WatchlistComponent,
    LoginComponent,
    SettingsComponent,

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

  ],
  providers: [MatchesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
