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
    // console.log("Testing dates hardcoded, comment out for real dates")
    //  var today = 27
    //  var tomorrow = today + 1;

    var today = new Date(Date.now()).getUTCDate();
    var tomorrow = today + 1;

    //console.log(today + " " + tomorrow);

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
      return (dateString.toString().slice(3,6) + dateString.toString().slice(0,3) + dateString.toString().slice(6, 19));
  }

  //returns date as a value.
  returnDayDate(gbDateFormat:string): number {
    return this.convertGBStringDate(gbDateFormat).getDate();
  }

  returnUserDate(epochTime:number): Date {
    return new Date(epochTime*1000);
  }
}
