import { Component, Inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  eachWordShouldBeginWithCapital,
  onlyAlphabeticalCharactersAndSpaceAllowed,
} from '@app/libs/validators';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  CreateStudent,
  Student,
  studentFormControls,
} from '@app/dashboard/students/students.interface';
import { StudentsService } from '@app/dashboard/students/students.service';
import {
  catchError,
  finalize,
  first,
  of,
  ReplaySubject,
  Subject,
  takeUntil,
} from 'rxjs';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { AsyncPipe, NgForOf } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { School, SchoolService } from '@app/dashboard/schools/school.service';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    MatButton,
    MatDialogClose,
    MatError,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    MatSelect,
    MatOption,
    AsyncPipe,
    NgxMatSelectSearchModule,
    NgForOf,
    MatCheckbox,
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
})
export class AddStudentComponent implements OnInit {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  public classesList: string[] = [];
  public studentForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      eachWordShouldBeginWithCapital(),
      onlyAlphabeticalCharactersAndSpaceAllowed(),
    ]),
    parent: new FormControl('', [
      Validators.required,
      eachWordShouldBeginWithCapital(),
      onlyAlphabeticalCharactersAndSpaceAllowed(),
    ]),
    grandParent: new FormControl('', [
      eachWordShouldBeginWithCapital(),
      onlyAlphabeticalCharactersAndSpaceAllowed(),
    ]),
    greatGrandparent: new FormControl('', [
      eachWordShouldBeginWithCapital(),
      onlyAlphabeticalCharactersAndSpaceAllowed(),
    ]),
    school: new FormControl('', [Validators.required]),
    level: new FormControl({ value: '', disabled: true }, [
      Validators.required,
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('[- +()0-9]{10,}'),
    ]),
    parentPhone: new FormControl('', [Validators.pattern('[- +()0-9]{6,}')]),
    description: new FormControl(''),
    boardingHouse: new FormControl(false),
  });
  public schoolFilterCtrl = new FormControl<string>('');
  public filteredSchools: ReplaySubject<School[]> = new ReplaySubject<School[]>(
    1
  );
  protected _onDestroy = new Subject<void>();
  protected schools: School[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddStudentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Student,
    private readonly studentService: StudentsService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private readonly schoolService: SchoolService
  ) {
    if (data) {
      console.log(data, 'data');
      this.title = 'Edit student details';
      this.subtext = 'kindly fill in the details to update the beneficiary';
      this.buttonText = 'Update';
      this.studentForm.patchValue({
        ...data,
        school: data.school.id,
      });
    } else {
      this.title = 'Add a new student';
      this.subtext = 'kindly fill in the details to create a new beneficiary';
      this.buttonText = 'Create';
    }
  }

  ngOnInit() {
    this.getAllSchools();
    this.schoolFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSchool();
      });

    this.studentForm.controls.school.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(value => {
        this.classesList =
          this.schools.find(school => school.id === value)?.classes || [];
        this.studentForm.controls.level.enable();
      });
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
          if (this.data) {
            this.classesList =
              this.schools.find(
                school => school.id === this.studentForm.controls.school.value
              )?.classes || [];
            this.studentForm.controls.level.enable();
          }
          this.filteredSchools.next(response.data.slice());
        }
      });
  }

  submit() {
    if (this.studentForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const studentData = this.studentForm.value as Omit<CreateStudent, 'id'>;
      if (!this.data) {
        this.studentService
          .addStudent(studentData)
          .pipe(
            first(),
            catchError(error => {
              this.toastrService.error(
                error.error.message,
                error.error.error || serverError
              );
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.dialogRef.disableClose = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response.data);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Awesome!',
                actionColor: 'primary',
                subtext: 'Great, student has been successfully added',
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
        const { id } = this.data;
        const student = this.studentForm.value as unknown as Omit<
          Student,
          'id'
        >;
        this.studentService
          .editStudent(id, student)
          .pipe(
            first(),
            catchError(error => {
              this.toastrService.error(
                error.error.message,
                error.error.error || serverError
              );
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.dialogRef.disableClose = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response.data);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Awesome!',
                actionColor: 'primary',
                subtext: 'Great, student has been successfully edited',
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
      }
    } else {
      this.studentForm.markAsDirty();
      this.studentForm.markAllAsTouched();
    }
  }

  getFormErrors(controlName: studentFormControls) {
    const control = this.studentForm.get(controlName);
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
