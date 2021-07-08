import { Injectable } from '@angular/core';
import { environment as env } from '../environments/environment.prod';
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

  public openSSE() {
    console.log("STREAM CONNECT");

    this.eventSource = new EventSource(env.serverUrl + '/api/updates');
    // this.eventSource = new EventSource('/');
    if(window.EventSource){
      this.eventSource.onopen = (event) => {
        console.log('SSE connection initialized!~', event);
      };

      this.eventSource.onmessage = (event) => {
        console.log("MongoStream incoming....");
        console.log(event.data);
        if(event.data != "hearbeat"){
          let streamUpdate = event.data;
          this.matchesService.addToUpdatedMatches(JSON.parse(streamUpdate));
        }
      };
    }
  }

  public closeSSE() {
    this.eventSource.close();
  }
}
