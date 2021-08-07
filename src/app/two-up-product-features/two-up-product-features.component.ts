import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-two-up-product-features',
  templateUrl: './two-up-product-features.component.html',
  styleUrls: ['./two-up-product-features.component.css']
})
export class TwoUpProductFeaturesComponent implements OnInit {
  @Input() displayProductFeatures:boolean = true;
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    console.log("Show Product FEATURES INIT: ", this.displayProductFeatures);
  }

  login():void{
    this.auth.loginWithRedirect();
  }

}
