import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserPropertiesService } from '../services/user-properties.service';
import { environment as env } from '../../environments/environment.prod';

@Component({
  selector: 'app-popup-subscribe',
  templateUrl: './popup-subscribe.component.html',
  styleUrls: ['./popup-subscribe.component.css']
})
export class PopupSubscribeComponent implements OnInit {

  constructor( public userPropertiesService: UserPropertiesService) { }

  public dialog: MatDialog;
  public productID:string;
  @ViewChild('payPalRef', {static:true}) private payPalRef:ElementRef;
  @Output() subActiveEvent = new EventEmitter<string>();

  ngOnInit(): void {

     const USER_EMAIL = this.userPropertiesService.getUserEmail();

    window.paypal.Buttons({
      createSubscription: async function(data, actions) {
        return actions.subscription.create({
          'plan_id': 'P-55U356720M569264VMD32CZI' // Creates the subscription
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
      fetch(env.serverUrl + '/cancel-subscription', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          subID: 'I-RRTYRCSWDW40 ' //track this
        })
      })
    }
 }
