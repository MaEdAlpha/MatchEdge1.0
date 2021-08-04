import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-two-up-product-features',
  templateUrl: './two-up-product-features.component.html',
  styleUrls: ['./two-up-product-features.component.css']
})
export class TwoUpProductFeaturesComponent implements OnInit {

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  login():void{
    this.auth.loginWithRedirect();
  }

}
