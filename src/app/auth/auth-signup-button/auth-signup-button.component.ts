import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'app-auth-signup-button',
  templateUrl: './auth-signup-button.component.html'
})
export class AuthSignupButtonComponent implements OnInit {

    constructor(public auth: AuthService) {}

    ngOnInit(): void {}

    loginWithRedirect(): void {
      this.auth.loginWithRedirect({ screen_hint: 'signup' });
    }
}
