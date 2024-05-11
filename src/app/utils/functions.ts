import { FormGroup } from '@angular/forms';

export const passwordValidator = (
  control: FormGroup
): { [key: string]: boolean } | null => {
  const password = control.value;
  if (!password) {
    return null;
  }

  if (password.length < 8) {
    return { minLength: true };
  }

  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*]).{8,}$/;
  if (!regex.test(password)) {
    return { weakPassword: true };
  }

  return null;
};
