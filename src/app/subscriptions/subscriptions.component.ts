import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatchesService } from '../match/matches.service';
import { environment as env } from '../../environments/environment.prod';
import { loadStripe } from "@stripe/stripe-js";
const stripe = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

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

  constructor(private matchesService: MatchesService, private http: HttpClient) { }

  ngOnInit(): void {
    //retrieve useSubscription info. How to handle it to prevent easy tampering?
    console.log(stripe);

    this.http.get(env.serverUrl + "/setup").subscribe( result => {
      console.log(result);
    });

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
    var handleFetchResult = function(result) {
      console.log(result);

      if (!result.ok) {
        return result.json().then(function(json) {
          if (json.error && json.error.message) {
            throw new Error(result.url + ' ' + result.status + ' ' + json.error.message);
          }
        }).catch(function(err) {
          showErrorMessage(err);
          throw err;
        });
      }
      return result.json();
    };
    // Handle any errors returned from Checkout
    var handleResult = function(result) {
      if (result.error) {
        showErrorMessage(result.error.message);
      }
    };

    var showErrorMessage = function(message) {
      var errorEl = document.getElementById("error-message")
      errorEl.textContent = message;
      errorEl.style.display = "block";
    };


    var createPurchaseSession = function(priceId) {
      return fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId: priceId
        })
      }).then(handleFetchResult);
    };
    //create an API call to backend that uses /create-checkout-session


    // Setup event handler to create a Checkout Session when button is clicked

        createPurchaseSession(priceId).then( async function(data) {
          // Call Stripe.js method to redirect to the new Checkout page
          console.log(data);

          await (await stripe).redirectToCheckout({sessionId: data.sessionId}).then(handleResult);
        });
  }
}
