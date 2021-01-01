import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timeDate'
})

export class TimeDatePipe extends DatePipe implements PipeTransform {
  transform(value: any): string {
    return super.transform(value, "HH:mm");
  }

}
