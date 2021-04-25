import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  //
  templateUrl:'./signup.component.html',
  styleUrls:['./signup.component.css']
})
export class SignupComponent{
  @ViewChild('signUpData') signupForm: NgForm;

  onSignup(form: NgForm){
    console.log(form.form);
  }
}
