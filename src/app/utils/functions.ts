import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordRegex: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const validPassword = passwordRegex.test(control.value);
    return validPassword ? null : { passwordMismatch: true };
  };
}

export function passwordMatchValidator(control: AbstractControl) {
  return control.get('password')?.value ===
    control.get('confirmPassword')?.value
    ? null
    : { mismatch: true };
}

export function encodeToBase64(data: string) {
  return btoa(encodeURIComponent(data));
}

export function decodeFromBase64(encodedData: string) {
  return decodeURIComponent(atob(encodedData));
}
