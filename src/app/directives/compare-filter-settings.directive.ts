import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[appCompareFilterSettings]',
  providers: [{provide: NG_VALIDATORS, useExisting: CompareFilterSettingsDirective, multi: true}]
})

export class CompareFilterSettingsDirective {

  constructor() { }

}
export const oddsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const minOdds = control.get('minOdds');
  const maxOdds = control.get('maxOdds');
  return (minOdds && maxOdds && +minOdds.value > +maxOdds.value) ? {oddsMismatch: true} : null;
};

export const evValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const evI = control.get('evFilterValueI');
  const evII = control.get('evFilterValueII');
  return (evI && evII && +evII.value < +evI.value) ? {evMismatch:true} : null;
};

export const mrValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const mrI = control.get('matchRatingFilterI');
  const mrII = control.get('matchRatingFilterII');
  return (mrI && mrII && ((+mrII.value < +mrI.value) || (+mrI.value > 100) || (+mrII.value > 100))) ? {mrMismatch:true}: null
};

export const ssValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const ssI = control.get('secretSauceI');
  const ssII = control.get('secretSauceII');

  return (ssI && ssII && +ssII.value < +ssI.value) ? {ssMismatch:true} : null;
};

