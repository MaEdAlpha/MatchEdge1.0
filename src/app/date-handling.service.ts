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

  //used in Notifications Box Service to qualify incoming stream data for user Notification
  returnBoundaries(selectedDate: string): {lowerLimit:number, upperLimit:number} {
   var epoch;
    switch(selectedDate) {
      case 'Today':
        // lowerLimit = Current Time in milliseconds Epoch
        // upperLimit = Today @ midnight or tomorrow 00:00:00
        epoch={
          lowerLimit: Date.now(),
          upperLimit: new Date(new Date().setDate( new Date().getDate() + 1)).setHours(0,0,0,0)
        }
        break;
      case 'Tomorrow':
        // Example January 1st 21:00:00 (my bed time). We select 'Tomorrow' our... lowerLimit = 02 Jan 00:00:00 & upperLimit = 03 Jan 00:00:00. Returns time in milliseconds ex: 1614877199000
        epoch = {
          lowerLimit: new Date( new Date().setDate( new Date().getDate() + 1 ) ).setHours(0,0,0,0),
          upperLimit: new Date( new Date().setDate( new Date().getDate() + 2 ) ).setHours(0,0,0,0),
        }
        break;
      case 'Today & Tomorrow':
        // lower = current time
        // upper = Tomorrow at midnight displayed as the date preceding tomorrow at 00:00:00.
        epoch = {
          lowerLimit: Date.now(),
          upperLimit: new Date( new Date().setDate( new Date().getDate() + 2 ) ).setHours(0,0,0,0),
        }
        break;
      default:
        console.log("Error Occured WTF man?");
    }
    return epoch;
  }
}
