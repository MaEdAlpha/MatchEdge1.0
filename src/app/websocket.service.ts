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

  constructor(private matchesService: MatchesService) { }

  public openWebSocket() {

    // this.eventSource = new EventSource('/');
    if(!!window.EventSource){
      this.eventSource = new EventSource('http://localhost:3000/api/updates');
      console.log("Just about to crash!");

      this.eventSource.onopen = (event) => {
        console.log('WSService.ts .onopen(): ', event);

        //connect changestream to return matchDataStreamStorage[].
      };

      // this.eventSource.addEventListener("message", function(event) {
      //   console.log("Recieved Message");

      //   console.log(event.data);

      // })

      this.eventSource.onmessage = (event) => {
        console.log("In EventSource On Message!");
        //console.log(event.data);

        //emit this event to match-table. Compare the values of smarkets and bet365 odds to currently stored values. Just overwrite these odds, no need to check.
        var streamObj = JSON.parse(event.data);
        //console.log(streamObj);

        // //emit changes to match-table and also juicy match.
        this.matchesService.addToUpdatedMatches(streamObj);
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
