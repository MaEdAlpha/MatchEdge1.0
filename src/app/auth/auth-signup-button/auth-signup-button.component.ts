import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { PopupDataProtectionRegulationComponent } from 'src/app/popup-data-protection-regulation/popup-data-protection-regulation.component';


@Component({
  selector: 'app-auth-signup-button',
  templateUrl: './auth-signup-button.component.html',
  styleUrls: ['./auth-signup-button.component.css']
})
export class AuthSignupButtonComponent implements OnInit {
  isNewUser:boolean;
  notificationService: any;
    constructor(public auth: AuthService, public dialog: MatDialog) {}

    ngOnInit(): void {
      this.isNewUser=true;
    }

    userAgreedToTermsOfUse(){
      if(this.isNewUser){
        const dialogReference = this.dialog.open(PopupDataProtectionRegulationComponent, {
          height:'45%',
          panelClass:'pyp-popup'
        });

        dialogReference.afterClosed().subscribe( userAcceptedTerms =>{
          console.log(`GDPR Result: ${userAcceptedTerms}`);
          userAcceptedTerms ? this.loginWithRedirect() : this.notificationService.cannotUseSite();
        });
      }
    }

    loginWithRedirect(): void {
      this.auth.loginWithRedirect({ screen_hint: 'signup' });
    }
}
