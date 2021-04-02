import { Injectable } from '@angular/core';
import { Match } from "./match/match.model";
import { MatchesService } from './match/matches.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  //eventSource: WebSocket;
  matchDataStreamStore: any[] = [];
  eventSource: EventSource;

  constructor(private matchesService: MatchesService) {

  }

  public openWebSocket() {
    this.eventSource = new EventSource('http://localhost:3000/api/updates');
    // this.eventSource = new EventSource('/');
    if(!!window.EventSource){


      this.eventSource.onopen = (event) => {
        console.log('WSService.ts .onopen(): ', event);
        //connect changestream to return matchDataStreamStorage[].
      };

      this.eventSource.onmessage = (event) => {
        console.log("In EventSource On Message!");
       // console.log(event.data);
       //emit this event to match-table. Compare the values of smarkets and bet365 odds to currently stored values. Just overwrite these odds, no need to check.
       this.matchesService.addToUpdatedMatches(JSON.parse(event.data));
      };
    }

  }

  // public sendMessage() {
  //   this.eventSource.send('Hello from Match-Table');
  // }

  public closeWebSocket() {
    this.eventSource.close();
  }
}
