import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatchesService } from '../match/matches.service';
import { environment as env } from '../../environments/environment.prod';
import { loadStripe } from "@stripe/stripe-js";
import { SimpleChanges } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { Subscription } from 'rxjs';
const stripe = loadStripe(env.STRIPE_PUBLISHABLE_KEY);


@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})


export class SubscriptionsComponent implements OnInit, OnChanges, OnDestroy {
  isActiveSub: boolean;
  isNewUser: boolean;
  subExpiration: number;
  infoSelected:number = 0;
  welcomeMessageSubscription: Subscription;
  userName:string;

  @Input() userEmail: string;
  @Output() displaySettings = new EventEmitter <boolean>();

  viewTables = new EventEmitter<boolean>();

  constructor(private matchesService: MatchesService, private userPropertiesService: UserPropertiesService, private http: HttpClient) { }
  ngOnChanges(simpleChanges: SimpleChanges) {
    if(simpleChanges.userEmail && simpleChanges.userEmail.isFirstChange) {
      console.log("Updated with user Email~" + this.userEmail);
      this.getUserSubscription();
    }
  }

  ngOnInit(): void {
    //retrieve useSubscription info. How to handle it to prevent easy tampering?
    this.isActiveSub=false;
    this.welcomeMessageSubscription = this.userPropertiesService.getSubscriptionState().subscribe( subState => {
      //assign landing page to returning user, or new user with custom message
      this.isActiveSub = subState;
      this.userName = this.userPropertiesService.getUserName();
      setTimeout( () =>{
        this.isNewUser = this.userPropertiesService.getUserMessage();
      },200)
    });
  }

  ngOnDestroy(){
    this.welcomeMessageSubscription.unsubscribe();
  }

  enterSite(){
    console.log("toggle it");
    this.displaySettings.emit(true);
    if(this.isActiveSub){
      this.matchesService.open2Ups();
    }
  }

  displayInfo(selected:number){
    this.infoSelected = selected;
  }

  customerPortal(userEmail: string){

    fetch(env.serverUrl +'/customer-portal', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: userEmail
      }),
    })
    .then(function(response) {
      console.log(response);

      return response.json()
    })
    .then(function(data) {
      window.location.href = data.url;
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
  }


  createCheckout(priceId:string){
    const userEmail = this.userPropertiesService.getUserEmail()
    console.log(userEmail);

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


    var createPurchaseSession = function(priceId, _email) {

      return fetch(env.serverUrl + "/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId: priceId,
          email: _email
        }),
      }).then(handleFetchResult);
    };
    //create an API call to backend that uses /create-checkout-session


    // Setup event handler to create a Checkout Session when button is clicked

        createPurchaseSession(priceId, userEmail).then( async function(data) {
          // Call Stripe.js method to redirect to the new Checkout page
          console.log(data);

          await (await stripe).redirectToCheckout({sessionId: data.sessionId}).then(handleResult);
        });
  }

  getUserSubscription(){
    this.userPropertiesService.getSubState(this.userEmail);
    this.userName = this.userPropertiesService.getUserName();
  }
}
