import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { serverError } from '@app/libs/constants';
import { BannerComponent } from '@app/shared/banner/banner.component';
import { Response } from '@app/shared/shared.type';
import { AvatarModule } from 'ngx-avatars';
import { ToastrService } from 'ngx-toastr';
import { Subject, catchError, filter, finalize, map, of, take } from 'rxjs';
import { Student } from '../students/students.interface';
import { StudentsService } from '../students/students.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    BannerComponent,
    AvatarModule,
    MatCardModule,
    MatError,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    TextFieldModule,
    MatButton,
  ],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss',
})
export class StudentProfileComponent implements OnInit, OnDestroy {
  public showBanner: boolean = false;

  public userProfileForm!: FormGroup;
  public isLoading = false;
  public isUpdateLoading = false;
  private unsubscribe = new Subject<void>();

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    private studentService: StudentsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private readonly toastrService: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      this.getBeneficiary(params['id']);
    });

    this.userProfileForm = this.fb.group({
      parent: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      parentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      school: ['', [Validators.required]],
      level: ['', [Validators.required]],
      description: [''],
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public getBeneficiary(id: string) {
    if (id) {
      this.studentService
        .getBeneficiary(id)
        .pipe(
          catchError(() => of(null)),
          filter((data): data is Response<Student> => !!data),
          map(data => {
            if (data.data) {
              return this.userProfileForm.patchValue(data.data);
            }
            this.showBanner = true;
            return;
          })
        )
        .subscribe();
    }
  }

  public closeBanner() {
    this.showBanner = false;
  }

  public get userName() {
    return this.authService.userName();
  }

  public createBeneficiary() {
    const { name, level, parent, parentPhone, phone, school, description } =
      this.userProfileForm.value;
    const userId = this.authService.loggedInUser()?.user.id;
    if (userId && this.userProfileForm.valid) {
      this.isLoading = true;
      this.studentService
        .createBeneficiary(
          userId,
          name,
          parent,
          school,
          level,
          phone,
          parentPhone,
          description
        )
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(response => {
          this.toastrService.success(response?.message);
        });
    }
  }

  public updateBeneficiary() {
    const { name, level, parent, parentPhone, phone, school, description } =
      this.userProfileForm.value;
    const userId = this.authService.loggedInUser()?.user.id;
    if (userId && this.userProfileForm.valid) {
      this.isUpdateLoading = true;
      this.studentService
        .updateBeneficiary(
          userId,
          name,
          parent,
          school,
          level,
          phone,
          parentPhone,
          description
        )
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => {
            this.isUpdateLoading = false;
          })
        )
        .subscribe(response => {
          this.toastrService.success(response?.message);
        });
    }
  }
}
