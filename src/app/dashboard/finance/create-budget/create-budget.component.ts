import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { CommonModule, Location } from '@angular/common';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { budgetDistributions, serverError } from '@app/libs/constants';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import {
  CreateBudget,
  CreateBudgetDistribution,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { catchError, finalize, first, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerComponent } from '@app/shared/banner/banner.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';

@Component({
  selector: 'app-create-budget',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    InfoCardComponent,
    CommonModule,
    MatError,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelect,
    MatOption,
    MatList,
    MatListItem,
    MatIcon,
    MatIconButton,
    MatDialogClose,
    BannerComponent,
    MatProgressSpinner,
    SpinnerComponent,
    MatCheckbox,
    MatChip,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-budget.component.html',
  styleUrl: './create-budget.component.scss',
})
export class CreateBudgetComponent implements OnInit {
  editId: string | undefined = undefined;
  budgetForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    total: ['', Validators.required],
    distributions: this.fb.array([]),
  });
  budgetDistributionsCategory = budgetDistributions;
  isLoading: boolean = false;
  public startMinDate = new Date();
  distributionForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', Validators.required],
    comments: [''],
    boardingHouse: [false],
  });
  showBanner = false;
  bannerText = '';
  totalDistribution = 0;
  isLoadingBudget = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly location: Location,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.canEditBudget();
    // this.budgetForm.valueChanges
    //   .pipe(
    //     tap(() => {
    //       const totalBudget = parseInt(
    //         this.budgetForm.controls.total.value || '0'
    //       );
    //       if (this.totalDistribution > totalBudget) {
    //         this.bannerText =
    //           'Your category distribution as exceeded your total budget. Please consider making an adjustment';
    //         this.showBanner = true;
    //       }
    //     })
    //   )
    //   .subscribe();
  }

  canEditBudget() {
    if (this.router.url.startsWith('/dashboard/finance/edit-budget/')) {
      const budgetId = this.activatedRoute.snapshot.params['id'];
      this.isLoadingBudget = true;
      this.financeService
        .getBudget(budgetId)
        .pipe(
          finalize(() => (this.isLoadingBudget = false)),
          tap(({ data }) => {
            this.editId = data.id;
            this.budgetForm.controls.total.setValue(data.total.toString());
            this.budgetForm.controls.startDate.setValue(
              data.startDate.toString()
            );
            this.budgetForm.controls.endDate.setValue(data.endDate.toString());
            data.budgetDistribution.map(({ amount, title }) => {
              this.distributionForm.controls.amount.setValue(amount.toString());
              this.distributionForm.controls.title.setValue(title);
              this.addDistribution();
            });
          })
        )
        .subscribe();
    }
  }

  addDistribution() {
    const amount = this.distributionForm.controls.amount.value;
    const values = new FormGroup({
      title: new FormControl(this.distributionForm.controls.title.value),
      amount: new FormControl(amount),
      comments: new FormControl(this.distributionForm.controls.comments.value),
      boardingHouse: new FormControl(
        !!this.distributionForm.controls.boardingHouse.value
      ),
    });
    this.totalDistribution += parseInt(amount as string);
    this.budgetForm.controls.total.setValue(this.totalDistribution.toString());
    this.budgetDistributions.push(values);
    this.distributionForm.reset();
  }

  get budgetDistributions(): FormArray {
    return this.budgetForm.controls.distributions as FormArray;
  }

  deleteDistribution(index: number) {
    this.totalDistribution -= parseInt(
      this.budgetDistributions.at(index).value.amount
    );
    this.budgetForm.controls.total.setValue(this.totalDistribution.toString());
    this.budgetDistributions.removeAt(index);
  }

  getCategories() {
    const distributions = new Set(
      (this.budgetDistributions.value as { title: string }[]).map(
        criteria => criteria.title
      )
    );
    return this.budgetDistributionsCategory.filter(
      category => !distributions.has(category.value)
    );
  }

  submit() {
    if (this.budgetForm.valid) {
      const budgetDetails: CreateBudget = {
        distributions: this.budgetForm.controls.distributions
          .value as CreateBudgetDistribution[],
        endDate: new Date(this.budgetForm.controls.endDate.value as string),
        startDate: new Date(this.budgetForm.controls.startDate.value as string),
        total: parseInt(this.budgetForm.controls.total.value as string),
      };
      this.isLoading = true;
      if (this.editId) {
        this.financeService
          .editBudget(this.editId, budgetDetails)
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
            })
          )
          .subscribe(response => {
            if (response) {
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext: 'Well done, You have successfully edited a budget',
                actionType: 'close',
              };
              this.dialog.open(ActionModalComponent, {
                maxWidth: '400px',
                maxHeight: '400px',
                width: '100%',
                height: '100%',
                data,
              });
              void this.router.navigate([
                'dashboard/finance/budget-allocation',
              ]);
            }
          });
      } else {
        this.financeService
          .createBudget(budgetDetails)
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
            })
          )
          .subscribe(response => {
            if (response) {
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext: 'Well done, You have successfully created a budget',
                actionType: 'close',
              };
              this.dialog.open(ActionModalComponent, {
                maxWidth: '400px',
                maxHeight: '400px',
                width: '100%',
                height: '100%',
                data,
              });
              void this.router.navigate([
                'dashboard/finance/budget-allocation',
              ]);
            }
          });
      }
    } else {
      this.budgetForm.markAllAsTouched();
    }
  }

  cancel() {
    this.location.back();
  }

  closeBanner() {
    this.showBanner = false;
  }
}
