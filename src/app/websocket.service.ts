import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators'
import { Match } from "./match/match.model";
import { MatchesService } from './match/matches.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  webSocket: WebSocket;
  matchDataStreamStore: any[] = [];

  constructor(private matchesService: MatchesService) { }

  public openWebSocket() {
    this.webSocket = new WebSocket('ws://localhost:3000/');

    this.webSocket.onopen = (event) => {
      console.log('WSService.ts .onopen(): ', event);
      //connect changestream to return matchDataStreamStorage[].
    };

    this.webSocket.onmessage = (event) => {
      //emit this event to match-table. Compare the values of smarkets and bet365 odds to currently stored values. Just overwrite these odds, no need to check.
      var streamObj: Match = JSON.parse(event.data);
      //emit changes to match-table and also juicy match.
      this.matchesService.addToUpdatedMatches(streamObj);
    };

    this.webSocket.onclose = (event) => {
      console.log('WSService.ts onclose(): ', event);
    }
  }

  public sendMessage() {
    this.webSocket.send('Hello from Match-Table');
  }

  public closeWebSocket() {
    this.webSocket.close();
  }
}
