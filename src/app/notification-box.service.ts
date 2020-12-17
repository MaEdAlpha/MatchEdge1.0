import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationBoxService {

  constructor(private toast: ToastrService) { }

  showNotification(){
    this.toast.success('Toastr Working', 'title');
  }
}
