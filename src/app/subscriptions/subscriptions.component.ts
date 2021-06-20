import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatchesService } from '../match/matches.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  isActiveSub: boolean  = false;
  subExpiration: number;
  infoSelected:number=0;
  viewTables = new EventEmitter<boolean>();
  constructor(private matchesService: MatchesService) { }

  ngOnInit(): void {
    //retrieve userSubscription info. How to handle it to prevent easy tampering?


  }

  enterSite(){
    console.log("toggle it");
    if(this.isActiveSub){
      this.matchesService.open2Ups();
    }
  }

  displayInfo(selected:number){
    this.infoSelected = selected;
  }


  createCheckout(priceId:string){
    console.log('hello');

    var createCheckoutSession = function(priceId) {
      return fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId: priceId
        })
      }).then(function(result) {
        return result.json();
      });
    };
    console.log("CHECKOUT SESSION INFO-------------------->");

    console.log(createCheckoutSession);
  }
}
