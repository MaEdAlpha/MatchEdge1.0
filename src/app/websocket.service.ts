import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators'
import { Match } from "./match/match.model";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  webSocket: WebSocket;
  matchDataStreamStorage: any[] = [];
  testMatches: any;

  constructor() { }

  public openWebSocket() {
    this.webSocket = new WebSocket('ws://localhost:3000/');

    this.webSocket.onopen = (event) => {
      console.log('WSService.ts .onopen(): ', event);
      //connect changestream to return matchDataStreamStorage[].
    };

    this.webSocket.onmessage = (event) => {

      //emit this event to match-table. Compare the values of smarkets and bet365 odds to currently stored values. Just overwrite these odds, no need to check.
      var obj: Match = JSON.parse(event.data);
      this.matchDataStreamStorage.push(obj);
      console.log("WSService.ts onmessage(): " + event.data + " In typeof: " + typeof obj);
    };

    this.webSocket.onclose = (event) => {
      console.log('WSService.ts onclose(): ', event);
    }
  }

  public sendMessage() {
    this.webSocket.send('Hello from Match-Table');
  }

  public updateStreamData()
  {
    console.log("reading socket data storage");
    console.log(this.matchDataStreamStorage);
    return this.matchDataStreamStorage;
  }

  public closeWebSocket() {
    this.webSocket.close();
  }
}
