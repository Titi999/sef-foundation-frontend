import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { decodeFromBase64 } from '@app/utils/functions';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.scss',
})
export class CheckEmailComponent implements OnInit, OnDestroy {
  private userEncodedEmail!: string;
  private unsubscribe = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.userEncodedEmail = params['encodedEmail'];
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public userEmail(): string {
    return decodeFromBase64(this.userEncodedEmail);
  }
}
