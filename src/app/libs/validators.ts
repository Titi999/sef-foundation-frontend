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

export function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex: RegExp = /^[a-zA-Z'-]+\s[a-zA-Z'-]+$/;
    const validFullName = regex.test(control.value);
    return validFullName ? null : { invalidFullName: true };
  };
}

export function eachWordShouldBeginWithCapital(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fullName = (control.value as string) || '';
    for (const word of fullName.split(' '))
      if (word[0] == undefined || word[0] == word[0].toLowerCase())
        return { eachWordShouldBeginWithCapital: true };
    return null;
  };
}

export function onlyAlphabeticalCharactersAndSpaceAllowed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex = /^[a-zA-Z\s]*$/;
    if (!((control.value as string) || '').match(regex))
      return { onlyAlphabeticalCharactersAndSpaceAllowed: true };
    return null;
  };
}
