import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { environment as env } from '../../environments/environment.prod'
import { NotificationBoxService } from '../services/notification-box.service';
import { PopupConfirmCancellationComponent } from '../popup-confirm-cancellation/popup-confirm-cancellation.component';
import { MatDialog } from '@angular/material/dialog';

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
  checked:boolean;
  constructor(public dialog: MatDialog, public userPropertiesService: UserPropertiesService, public chRef: ChangeDetectorRef, public boxNotificationService: NotificationBoxService) { }

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
  }

  cancelSubscription():void{
    //retrieve subscriptionID and send command to paypal to cancel subscription.
    this.dialog.open( PopupConfirmCancellationComponent,{panelClass:'goodbye-dialog', data:{expiry:this.nextPayment}});
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

  sillyClick(){
    this.checked = false;
    this.boxNotificationService.showLove();
  }

}
