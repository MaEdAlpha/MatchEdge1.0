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

}
