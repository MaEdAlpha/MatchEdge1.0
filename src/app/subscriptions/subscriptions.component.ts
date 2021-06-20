import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  isActiveSub: boolean  = false;
  subExpiration: number;
  constructor() { }

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
