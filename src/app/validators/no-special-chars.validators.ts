import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noSpecialChars(
  control: AbstractControl
): ValidationErrors | null {
  const forbidden = /[^a-zA-Z0-9]/.test(control.value); // allow only letters & numbers
  return forbidden ? { specialChar: true } : null;
}
