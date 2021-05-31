import { Injectable } from '@angular/core';
import { environment as env } from '../environments/environment.prod';
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
    console.log("STREAM CONNECT");

    this.eventSource = new EventSource(env.serverUrl + '/api/updates');
    // this.eventSource = new EventSource('/');
    if(!!window.EventSource){
      this.eventSource.onopen = (event) => {
        console.log('WSService.ts .onopen(): ', event);
        //connect changestream to return matchDataStreamStorage[].
      };

      this.eventSource.onmessage = (event) => {
        console.log("MongoStream incoming....");
        console.log(event.data);

        this.matchesService.addToUpdatedMatches(JSON.parse(event.data));
      };
    }

  }

  public closeWebSocket() {
    this.eventSource.close();
  }
}
