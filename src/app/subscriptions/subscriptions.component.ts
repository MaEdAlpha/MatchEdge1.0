
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatchesService } from '../match/matches.service';
import { environment as env } from '../../environments/environment.prod';
import { SimpleChanges } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationBoxService } from '../services/notification-box.service';
import { PopupTwoUpProductComponent } from '../popup-two-up-product/popup-two-up-product.component';
import { PopupSubscribeComponent } from '../popup-subscribe/popup-subscribe.component';
import { PopupManageBillingComponent } from '../popup-manage-billing/popup-manage-billing.component';
// import { loadStripe } from "@stripe/stripe-js";
// const stripe = loadStripe(env.STRIPE_PUBLISHABLE_KEY);


@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})


export class SubscriptionsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  isActiveSub: boolean;
  isNewUser: boolean = true;
  subExpiration: string;
  infoSelected:boolean = false;
  welcomeMessageSubscription: Subscription;
  userName:string;
  isLoading:boolean;
  accountStatus:string;

  @Input() userEmail: string;
  @Output() displaySettings = new EventEmitter <boolean>();

  viewTables = new EventEmitter<boolean>();

  constructor(private matchesService: MatchesService,
    private userPropertiesService: UserPropertiesService,
    public dialog: MatDialog,
    public notificationService: NotificationBoxService,
    public chRef: ChangeDetectorRef) { }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if(simpleChanges.userEmail && simpleChanges.userEmail.isFirstChange) {
      this.getUserSubscription();
    }
  }

  ngOnInit(): void {
    //retrieve useSubscription info. How to handle it to prevent easy tampering?
    this.isActiveSub = null;
    this.isNewUser = true;
    this.isLoading = true;

    this.welcomeMessageSubscription = this.userPropertiesService.getSubscriptionState().subscribe( user => {
      //assign landing page to returning user, or new user with custom message
      this.isLoading = false;
      this.isActiveSub = user.isActiveSub;
      this.userName = this.userPropertiesService.getUserName();
      this.isNewUser = user.isNewUser;
      this.accountStatus = user.status;
      this.subExpiration = user.expiry
    });
  }

  ngAfterViewInit(){

  }

  ngOnDestroy(){
    this.welcomeMessageSubscription.unsubscribe();
  }

  //Notes: You setup app.js to create upon checkout an accepted_terms field which auto sets to true. If user has not signed up and bought a subscription, they will have to go through GDPR popup every

  enterSite(){
    this.displaySettings.emit(true);
    if(this.isActiveSub){
      this.matchesService.open2Ups();
    }
  }

  displayInfo(){

    this.infoSelected = !this.infoSelected;

    if(this.infoSelected){
      setTimeout(()=>{
        document.querySelector('#info').scrollIntoView({ block:"start", inline:"center", behavior: "smooth"});
      },200)

    }else {
      setTimeout(()=>{
        document.querySelector('#focal-point').scrollIntoView({ block:"end", inline:"center", behavior: "smooth"});
      },200)
    }
  }

  openManageBillingPopUp(){
    this.dialog.open(PopupManageBillingComponent,
      {
        width: '50%',
        height: '50%',
        panelClass:'manage-billing-page'
      });
  }

  openProductPopup(){
    this.dialog.open(PopupTwoUpProductComponent,
    {
      width: '100%',
      height:  '100%',
      panelClass:'two-up-product'
    });
  }

  payPalPortal(){
    // paypal.Buttons({
    //   createOrder: function(data, actions) {
    //     return actions.order.create({
    //       purchase_units: [{
    //         amount: {
    //           value: '0.01'
    //         }
    //       }]
    //     });
    //   },
    //   onApprove: function(data, actions) {
    //     return actions.order.capture().then(function(details) {
    //       alert('Transaction completed by ' + details.payer.name.given_name);
    //     });
    //   }
    // }).render('#paypal-button-container');
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


 popupViewCheckout(){
   const dialogRef = this.dialog.open(PopupSubscribeComponent,
    {
      height:'100%',
      width:'100%',
      panelClass: 'two-up-product'
    });

    dialogRef.afterClosed().subscribe(()=>{
      this.userPropertiesService.getSubState(this.userEmail);
    });
 }

  getUserSubscription(){
    console.log("Checking for user Subscription... " + this.userEmail);

    this.userPropertiesService.getSubState(this.userEmail);
    this.userName = this.userPropertiesService.getUserName();
    this.chRef.detectChanges();
  }


}
