import { Component } from '@angular/core';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [NgOtpInputModule, MatButtonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss',
})
export class VerificationComponent {
  public onOtpChange(event: string): void {
    console.log('otp change', event);
  }
}
