import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment as env } from '../environments/environment.prod';
import { MatchesService } from './match/matches.service';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  //eventSource: WebSocket;
  matchDataStreamStore: any[] = [];
  eventSource: EventSource;
  //database driven value observable. used for sending custom messages to site users. 
  emitSiteWideEvent = new Subject<any>();


  constructor(private matchesService: MatchesService ) {
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
        console.log(event);
        
        if(event.data == "heartbeat"){
          // this.matchesService.triggerChangeDetection('blip');
        }
        
        if(event.data != "heartbeat"){
          let streamUpdate = JSON.parse(event.data);

          if(streamUpdate.juicybets){
            this.emitSiteWideEvent.next(streamUpdate);
          }else{
            this.matchesService.addToUpdatedMatches(streamUpdate);
          }
        } 
      };
    }
  }

  public closeSSE() {
    this.eventSource.close();
  }
  getSiteWideEventListener(): Observable<any>{
    return this.emitSiteWideEvent.asObservable();
  }

 
}
