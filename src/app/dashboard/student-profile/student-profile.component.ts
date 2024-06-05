import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
import {
  ReplaySubject,
  Subject,
  catchError,
  filter,
  finalize,
  first,
  map,
  of,
  take,
  takeUntil,
} from 'rxjs';
import { CreateStudent, Student } from '../students/students.interface';
import { StudentsService } from '../students/students.service';
import { School, SchoolService } from '../schools/school.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

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
    MatOption,
    MatSelect,
    CommonModule,
    NgxMatSelectSearchModule,
    SpinnerComponent,
  ],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss',
})
export class StudentProfileComponent implements OnInit, OnDestroy {
  public showBanner: boolean = false;

  public userProfileForm = this.fb.group({
    id: ['', Validators.required],
    parent: ['', Validators.required],
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    parentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    school: ['', [Validators.required]],
    level: ['', [Validators.required]],
    description: [''],
  });
  public isLoading = false;
  public loading = false;
  public isUpdateLoading = false;
  public userId!: string;
  private unsubscribe = new Subject<void>();
  public schoolFilterCtrl = new FormControl<string>('');
  public filteredSchools: ReplaySubject<School[]> = new ReplaySubject<School[]>(
    1
  );
  protected schools: School[] = [];
  protected _onDestroy = new Subject<void>();

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    private studentService: StudentsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private readonly toastrService: ToastrService,
    private route: ActivatedRoute,
    private schoolService: SchoolService
  ) {}

  ngOnInit(): void {
    this.getAllSchools();
    this.route.params.pipe(take(1)).subscribe(params => {
      this.userId = params['id'];
      this.getBeneficiary(params['id']);
    });

    this.schoolFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSchool();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private getBeneficiary(id: string) {
    if (id) {
      this.loading = true;
      this.studentService
        .getBeneficiary(id)
        .pipe(
          catchError(() => of(null)),
          filter((data): data is Response<Student> => !!data),
          map(({ data }) => {
            if (data) {
              const { school, ...rest } = data;
              this.userProfileForm.controls.school.setValue(school.id);
              this.loading = false;
              return this.userProfileForm.patchValue(rest);
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
      this.userProfileForm.value as CreateStudent;
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
      this.userProfileForm.value as CreateStudent;
    if (this.userId && this.userProfileForm.valid) {
      this.isUpdateLoading = true;
      this.studentService
        .updateBeneficiary(
          this.userId,
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

  public getAllSchools() {
    return this.schoolService
      .getAllSchools()
      .pipe(
        first(),
        catchError(error => {
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        }),
        finalize(() => {})
      )
      .subscribe(response => {
        if (response) {
          this.schools = response.data;
          this.filteredSchools.next(response.data.slice());
        }
      });
  }

  protected filterSchool() {
    if (!this.schools) {
      return;
    }
    let search = this.schoolFilterCtrl.value as string;
    if (!search) {
      this.filteredSchools.next(this.schools.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSchools.next(
      this.schools.filter(
        school => school.name.toLowerCase().indexOf(search) > -1
      )
    );
  }
}
