import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'headerDate'
})

export class HeaderDatePipe extends DatePipe implements PipeTransform {
  // transform(value: string): string {
  //   return super.transform(value, "EEE MMM d");
  // }
}
