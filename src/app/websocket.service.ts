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
    this.eventSource = new EventSource(env.serverUrl + '/api/updates');
    // this.eventSource = new EventSource('/');
    if(window.EventSource){
      this.eventSource.onopen = (event) => {
        // console.log('SSE connection initialized!~', event);
      };

      this.eventSource.onmessage = (event) => {
        console.log("EventIncoming--");
        if(event.data != "heartbeat"){
          let streamUpdate = JSON.parse(event.data);
          console.log(streamUpdate);
          this.matchesService.addToUpdatedMatches(streamUpdate);
        }
      };
    }
  }

  public closeSSE() {
    this.eventSource.close();
  }
}
