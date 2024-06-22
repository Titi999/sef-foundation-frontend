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
  takeUntil,
} from 'rxjs';
import { CreateStudent, Student } from '../students/students.interface';
import { StudentsService } from '../students/students.service';
import { School, SchoolService } from '../schools/school.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import {
  eachWordShouldBeginWithCapital,
  onlyAlphabeticalCharactersAndSpaceAllowed,
} from '@app/libs/validators';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { MatDialog } from '@angular/material/dialog';

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
  public beneficiaryExists = false;
  public classesList: string[] = [];
  public userProfileForm = this.fb.group({
    id: [''],
    parent: [
      '',
      [
        Validators.required,
        eachWordShouldBeginWithCapital(),
        onlyAlphabeticalCharactersAndSpaceAllowed(),
      ],
    ],
    name: [
      '',
      [
        Validators.required,
        eachWordShouldBeginWithCapital(),
        onlyAlphabeticalCharactersAndSpaceAllowed(),
      ],
    ],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    parentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    school: ['', [Validators.required]],
    level: ['', [Validators.required]],
    grandParent: [
      '',
      [
        eachWordShouldBeginWithCapital(),
        onlyAlphabeticalCharactersAndSpaceAllowed(),
      ],
    ],
    greatGrandparent: [
      '',
      [
        eachWordShouldBeginWithCapital(),
        onlyAlphabeticalCharactersAndSpaceAllowed(),
      ],
    ],
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
    private schoolService: SchoolService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllSchools();
    this.getBeneficiary(this.route.snapshot.params['id']);

    this.schoolFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSchool();
      });

    this.userProfileForm.controls.school.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(value => {
        this.classesList =
          this.schools.find(school => school.id === value)?.classes || [];
        this.userProfileForm.controls.level.enable();
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
          finalize(() => (this.loading = false)),
          catchError(() => of(null)),
          filter((data): data is Response<Student> => !!data),
          map(({ data }) => {
            if (data) {
              this.beneficiaryExists = true;
              const { school, ...rest } = data;
              this.userProfileForm.controls.school.setValue(school.id);
              return this.userProfileForm.patchValue(rest);
            }
            this.beneficiaryExists = false;
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
    const {
      name,
      level,
      parent,
      parentPhone,
      phone,
      school,
      description,
      greatGrandparent,
      grandParent,
    } = this.userProfileForm.value as CreateStudent;
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
          grandParent,
          greatGrandparent,
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
          if (response) {
            this.beneficiaryExists = true;
            const data: ActionModalData = {
              actionIllustration: ActionModalIllustration.success,
              title: 'Awesome!',
              actionColor: 'primary',
              subtext:
                'Great, Beneficiary Information has been successfully added',
              actionType: 'close',
            };
            this.dialog.open(ActionModalComponent, {
              maxWidth: '400px',
              maxHeight: '400px',
              width: '100%',
              height: '100%',
              data,
            });
          }
          this.toastrService.success(response?.message);
        });
    }
  }

  public updateBeneficiary() {
    const {
      id,
      name,
      level,
      parent,
      parentPhone,
      phone,
      school,
      description,
      grandParent,
      greatGrandparent,
    } = this.userProfileForm.value as CreateStudent;
    if (this.userProfileForm.valid) {
      this.isUpdateLoading = true;
      this.studentService
        .updateBeneficiary(
          id,
          name,
          parent,
          school,
          level,
          phone,
          parentPhone,
          grandParent,
          greatGrandparent,
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
          if (response) {
            const data: ActionModalData = {
              actionIllustration: ActionModalIllustration.success,
              title: 'Awesome!',
              actionColor: 'primary',
              subtext:
                'Great, beneficiary information has been successfully edited',
              actionType: 'close',
            };
            this.dialog.open(ActionModalComponent, {
              maxWidth: '400px',
              maxHeight: '400px',
              width: '100%',
              height: '100%',
              data,
            });
          }
        });
    } else {
      this.userProfileForm.markAllAsTouched();
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

  getFormErrors(controlName: string) {
    const control = this.userProfileForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    switch (controlName) {
      case 'parent':
        if (control?.errors?.['eachWordShouldBeginWithCapital']) {
          return 'Each name should begin with a capital letter';
        }
        if (control?.errors?.['onlyAlphabeticalCharactersAndSpaceAllowed']) {
          return 'Only Alphabets and spaces allowed';
        }
        break;
      case 'greatGrandparent':
        if (control?.errors?.['eachWordShouldBeginWithCapital']) {
          return 'Each name should begin with a capital letter';
        }
        if (control?.errors?.['onlyAlphabeticalCharactersAndSpaceAllowed']) {
          return 'Only Alphabets and spaces allowed';
        }
        break;
      case 'grandParent':
        if (control?.errors?.['eachWordShouldBeginWithCapital']) {
          return 'Each name should begin with a capital letter';
        }
        if (control?.errors?.['onlyAlphabeticalCharactersAndSpaceAllowed']) {
          return 'Only Alphabets and spaces allowed';
        }
        break;
      case 'name':
        if (control?.errors?.['eachWordShouldBeginWithCapital']) {
          return 'Each name should begin with a capital letter';
        }
        if (control?.errors?.['onlyAlphabeticalCharactersAndSpaceAllowed']) {
          return 'Only Alphabets and spaces allowed';
        }
        break;
      case 'phone':
        return 'Please provide a valid phone number';
      case 'parentPhone':
        return 'Please provide a valid phone number';
      default:
        return '';
    }
    return '';
  }
}
