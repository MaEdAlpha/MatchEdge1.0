import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {
  @Input() accountFormValues: any;
  @Output() accountFormValuesChange = new EventEmitter<any>();
  profileJson: string = null;
  accountForm: FormGroup;

  constructor(public auth: AuthService) {}


  ngOnInit(): void {
    console.log("ACCOUNT");

    console.log(this.accountFormValues);

    this.accountForm = new FormGroup({
      UserName: new FormControl(this.accountFormValues.UserName),
      FirstName: new FormControl(this.accountFormValues.FirstName),
      LastName: new FormControl(this.accountFormValues.LastName),
      Email: new FormControl(this.accountFormValues.Email),
      Quote: new FormControl(this.accountFormValues.Quote),
    });

    this.accountForm.valueChanges.subscribe( (value) => {
      this.accountFormValuesChange.emit(value);
      console.log(value);

    });

    this.auth.user$.subscribe(
      (profile) => (this.profileJson = JSON.stringify(profile, null, 2))
    );
  }



}
