import { Injectable, signal } from '@angular/core';
import { UserLoginResponse } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<UserLoginResponse | undefined>(undefined);

  public readonly loggedInUser = this.userSignal.asReadonly();

  public isAuthenticated(): boolean {
    if (!this.loggedInUser()) {
      return false;
    }

    return true;
  }
}
