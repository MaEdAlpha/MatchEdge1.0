import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MatchTableComponent } from './match-table/match-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule} from '@angular/material/table';
import { MatchComponent } from './match/match.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MatchTableComponent,
    MatchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
