import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {
  @Input() accountFormValues: any;
  @Output() accountFormValuesChange = new EventEmitter<any>();

  accountForm: FormGroup;

  constructor() { }

  ngOnInit(): void {

    this.accountForm = new FormGroup({
      UserName: new FormControl(this.accountFormValues.UserName),
      FirstName: new FormControl(this.accountFormValues.FirstName),
      LastName: new FormControl(this.accountFormValues.LastName),
      Email: new FormControl(this.accountFormValues.Email),
      Quote: new FormControl(this.accountFormValues.Quote),
      Password: new FormControl(this.accountFormValues.Password)
    });

    this.accountForm.valueChanges.subscribe( (value) => {
      this.accountFormValuesChange.emit(value);
      console.log(value);

    });
  }



}
