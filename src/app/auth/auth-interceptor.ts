import {  HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserPropertiesService } from "../services/user-properties.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private userService: UserPropertiesService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable < any > {
    const  authToken = localStorage.getItem('token');
    console.log("===>Intcpr Called: " + authToken);

    //manipulate request to use token. Must clone or it breaks.

      let authRequest = req.clone({
        headers: req.headers.append('Authorization', "Bearer " + authToken)
      });
      return next.handle(authRequest).pipe( catchError(err => {
        console.log(err);
        
        return of(err);
      }));

  }
}
