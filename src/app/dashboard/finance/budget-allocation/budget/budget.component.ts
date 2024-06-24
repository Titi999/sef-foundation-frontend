import {
  Component,
  computed,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatIcon } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { finalize, first, tap } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatTableModule } from '@angular/material/table';
import { BudgetAllocation } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    AsyncPipe,
    BaseChartDirective,
    MatCard,
    MatCardModule,
    MatCardContent,
    MatFormFieldModule,
    MatGridListModule,
    MatCardContent,
    MatCardHeader,
    SpinnerComponent,
    MatIcon,
    MatTableModule,
    CurrencyPipe,
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
})
export class BudgetComponent implements OnInit {
  isLoading = false;
  chartLabel: WritableSignal<string[]> = signal([]);
  chartData: WritableSignal<number[]> = signal([]);
  chartDataSefBoarding: WritableSignal<number[]> = signal([]);
  chartLabelSefBoarding: WritableSignal<string[]> = signal([]);

  public chart: Signal<ChartData<'doughnut'>> = computed(() => {
    return {
      labels: this.chartLabel(),
      datasets: [
        {
          data: this.chartData(),
          backgroundColor: [
            'rgba(31, 101, 135, 1)',
            'rgba(197, 231, 255, 1)',
            'rgba(0, 30, 45, 1)',
            'rgba(215, 218, 223, 1)',
          ],
          hoverOffset: 2,
        },
      ],
    };
  });
  public chartSefBoarding: Signal<ChartData<'doughnut'>> = computed(() => {
    return {
      labels: this.chartLabelSefBoarding(),
      datasets: [
        {
          data: this.chartDataSefBoarding(),
          backgroundColor: [
            'rgba(31, 101, 135, 1)',
            'rgba(197, 231, 255, 1)',
            'rgba(0, 30, 45, 1)',
            'rgba(215, 218, 223, 1)',
          ],
          hoverOffset: 2,
        },
      ],
    };
  });
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartConfiguration['options'] = {
    devicePixelRatio: 2,
    maintainAspectRatio: true,
    responsive: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        fullSize: true,
      },
    },
  };

  public cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Budget Split Details', cols: 4, rows: 5, id: 1 },
          { title: 'Budget Split Summary', cols: 4, rows: 5, id: 2 },
          {
            title: 'Budget Executive Summary - EXPANDED',
            cols: 4,
            rows: 5,
            id: 3,
          },
        ];
      }

      return [
        {
          title: 'Budget Split Details',
          cols: 2,
          rows: 2,
          id: 1,
        },
        {
          title: 'Budget Split Summary',
          cols: 2,
          rows: 2,
          id: 2,
        },
        {
          title: 'Budget Executive Summary - EXPANDED',
          cols: 4,
          rows: 3,
          id: 3,
        },
      ];
    })
  );

  displayedColumns: string[] = ['description', 'comments', 'amount'];
  budgetAllocation!: BudgetAllocation;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly activatedRoute: ActivatedRoute,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit() {
    this.getBudget();
  }

  public getBudget() {
    const id = this.activatedRoute.snapshot.params['id'];
    this.isLoading = true;
    this.financeService
      .getBudget(id)
      .pipe(
        first(),
        finalize(() => (this.isLoading = false)),
        tap(({ data }) => {
          this.budgetAllocation = data;
          const chartLabel: string[] = [];
          const chartLabelSefBoarding: string[] = [
            'SEF BOARDING HOUSE',
            'NON SEF BOARDING HOUSE',
          ];
          const chartValues: number[] = [];
          let sefBoardingTotal = 0;
          let nonSefBoardingTotal = 0;
          data.budgetDistribution.forEach(distribution => {
            chartLabel.push(distribution.title);
            chartValues.push(distribution.amount);
            if (distribution.boardingHouse) {
              sefBoardingTotal += distribution.amount;
            } else {
              nonSefBoardingTotal += distribution.amount;
            }
          });
          this.chartLabelSefBoarding.set(chartLabelSefBoarding);
          this.chartDataSefBoarding.set([
            sefBoardingTotal,
            nonSefBoardingTotal,
          ]);
          this.chartLabel.set(chartLabel);
          this.chartData.set(chartValues);
        })
      )
      .subscribe();
  }
}
