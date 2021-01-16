import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateHandlingService {


  private dateSubject = new Subject<any>();

  //receives from data source changes you want subscribers to get
  sendSelectedDate(data: string){
    this.dateSubject.next(data);
  }

  //Returns Observable to listen to any changes to dateSubject.
  getSelectedDate(): Observable<any> {
    return this.dateSubject.asObservable();
  }

  //Processes dateSelection from Top Layer filter. Returns number array of start and end date.
  returnDateSelection(dateSelected: string): number[] {
    //Testing Values
    var today = 15
    var tomorrow = today + 1;

    /* Real Values. DO NOT DELETE
    //returns day date as an integer
    */
   //Create a unique number to account for month changes. This way January 31st And February 1st will properly register as today + tomorrow
   //Concatenate string, then turn to integer. ES6 format.
    // var today = new Date(Date.now()).getMonth()*30 + new Date(Date.now()).getDate();
    // var tomorrow = today + 1;


    if(dateSelected == 'Today')
    {
      return [+today,+today];
    }
    if(dateSelected == 'Tomorrow')
    {
      return [+tomorrow,+tomorrow];
    }
    if(dateSelected == 'Today & Tomorrow')
    {
      return [+today,+tomorrow];
    }
  }

  //returns usDateFormat. Used for comparing dates with Selected time for filtering.
  convertGBStringDate(gbDateFormat: string): Date {
    var usDateFormat = this.switchDaysWithMonths(gbDateFormat);
    return new Date(Date.parse(usDateFormat));
  }

  //converts GB formatted date to US date string.
  switchDaysWithMonths(dateString: string):string {
    return dateString.slice(3,6) + dateString.slice(0, 3) + dateString.slice(6, 19);
  }

  //returns date as a value.
  returnDayDate(gbDateFormat:string): number {
    return this.convertGBStringDate(gbDateFormat).getDate();
  }
}
