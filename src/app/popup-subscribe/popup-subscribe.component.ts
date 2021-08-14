import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { environment as env } from '../../environments/environment.prod';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-subscribe',
  templateUrl: './popup-subscribe.component.html',
  styleUrls: ['./popup-subscribe.component.css']
})
export class PopupSubscribeComponent implements OnInit {

  constructor( public userPropertiesService: UserPropertiesService) { }
  private isNewUser:boolean;
  private plan:{promo:string, basic:string};
  public returningSubscription: Subscription;
  @ViewChild('payPalRef', {static:true}) private payPalRef:ElementRef;


  ngOnInit(): void {
      this.isNewUser = this.userPropertiesService.getUserAccountType();
     this.returningSubscription = this.userPropertiesService.getSubscriptionState().subscribe( result => {
       this.isNewUser = result.isNewUser;
       console.log(this.isNewUser ? "Promotion Plan being used!": "Basic Plan being used!");
     });
     console.log(this.isNewUser ? "Promotion Plan being used!": "Basic Plan being used!");
     this.plan = this.userPropertiesService.getPlans();
     const USER_EMAIL = this.userPropertiesService.getUserEmail();
     const planID = this.isNewUser ?  this.plan.promo : this.plan.basic;
    window.paypal.Buttons({
      createSubscription: async function(data, actions) {
        return actions.subscription.create({
          'plan_id': planID // Creates the subscription
        });
      },
      onApprove: function(data, actions) {
        let time = Date.now();
        return fetch(env.serverUrl + '/paypal-transaction', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            orderID: data.orderID,
            orderCreated: time,
            email: USER_EMAIL,
            subID: data.subscriptionID  //track this
          })
        }).then(function(res) {
          return res.json();
        }).then(function(details) {
          alert('Transaction approved! We have sent an invoice to ' + details.invoiced_to);
        })
      },
      onCancel: function(data) {
        alert("Canceled Subscription");
        console.log(data);

      },
      onError: function(err){
        console.log(err);
        console.log("logged error");
      }
    }).render(this.payPalRef.nativeElement)
  }


    showID(){
    }
 }
