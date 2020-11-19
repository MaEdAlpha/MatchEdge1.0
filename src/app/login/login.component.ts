import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector:'app-login',
  templateUrl:'./login.component.html',
  styleUrls:['./login.component.css']
})
export class LoginComponent{
  @ViewChild('formData') signupForm: NgForm;
  defaultQuestion = "location";
  answer='';

  suggestUserName() {
    const suggestName = 'Georgio Seruloupolous Ganopolous';
    // this.signupForm.setValue({
    //   userData: {
    //     username: suggestName,
    //     email: 'fill@me.in'
    //   },
    //     secret: 'location',
    //     questionAnswer: 'Baltimore MA',
    // });
    this.signupForm.form.patchValue({
      userData: {
        username: suggestName
      }
    });
  }

  onSubmit(form: NgForm){
    console.log(form.form);
    console.log(form.value.userData.username + " " + form.value.userData.email + " " + form.value.questionAnswer);
  }
}
