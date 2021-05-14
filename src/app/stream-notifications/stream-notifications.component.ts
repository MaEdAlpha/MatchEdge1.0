import { Component, OnInit, QueryList, Renderer2, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-stream-notifications',
  templateUrl: './stream-notifications.component.html',
  styleUrls: ['./stream-notifications.component.css']
})
export class StreamNotificationsComponent implements OnInit {

  @ViewChild(ToastContainerDirective, {static: true}) toastContainer: ToastContainerDirective;

  constructor(public toastr: ToastrService, private renderer: Renderer2) { }

  ngOnInit() {
    this.toastr.overlayContainer = this.toastContainer;
  }
}
