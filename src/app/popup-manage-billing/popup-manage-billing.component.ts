import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { environment as env } from '../../environments/environment.prod'

@Component({
  selector: 'app-popup-manage-billing',
  templateUrl: './popup-manage-billing.component.html',
  styleUrls: ['./popup-manage-billing.component.css']
})
export class PopupManageBillingComponent implements OnInit {
  billingObject:Promise<{subscription: string, status: string, lastPaid:string, nextPayment:string, paymentEmail:string}>;
  lastPaid:string;
  paymentEmail:string;
  nextPayment:string;
  subscription: string;
  subscriptionStatus: string;
  constructor(public userPropertiesService: UserPropertiesService, public chRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.billingObject = this.userPropertiesService.getBillingInfo(this.userPropertiesService.getUserEmail());
    this.billingObject.then(result =>{
      this.subscription = result.subscription;
      this.subscriptionStatus = result.status;
      this.lastPaid = result.lastPaid;
      this.nextPayment = result.nextPayment;
      this.paymentEmail = result.paymentEmail;
      this.chRef.detectChanges();
    });





    //get userName
    //get user specific details
    //signup-date
    //next payment
    //email used for payment.
  }

  cancelSubscription():void{
    //retrieve subscriptionID and send command to paypal to cancel subscription.
    fetch(env.serverUrl + '/cancel-subscription', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subID: this.subscription //track this
      })
    });

  }

}
