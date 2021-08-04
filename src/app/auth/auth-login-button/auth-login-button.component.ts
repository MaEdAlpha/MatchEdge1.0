
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-auth-login-button',
  templateUrl: './auth-login-button.component.html',
  styleUrls: ['./auth-login-button.component.css']

})
export class AuthLoginButtonComponent implements OnInit {

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}

  loginWithRedirect(): void {
    this.auth.loginWithRedirect();
  }
}
