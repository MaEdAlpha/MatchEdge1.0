import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  //
  templateUrl:'./login.component.html',
  styleUrls:['./login.component.css']
})
export class LoginComponent{
  @ViewChild('formData') loginForm: NgForm;

  onLogin(login: NgForm){
    console.log(login.form);
  }
}
