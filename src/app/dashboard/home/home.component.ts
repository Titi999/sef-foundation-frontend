import { Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem } from '@angular/material/menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatIconButton,
    BaseChartDirective,
    MatSelect,
    MatOption,
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe,
    MatChip,
    MatMenu,
    MatMenuItem,
    TitleCasePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [20, 30, 10, 40, 80, 50],
        label: 'Total Funding Disbursed Over Time',
        borderColor: 'rgba(31, 101, 135, 1)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        pointStyle: 'line',
      },
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    plugins: {
      legend: { display: false },
    },
  };
  public lineChartType: ChartType = 'line';

  public doughnutChartLabels: string[] = [
    'Scholarships',
    'Stipends',
    'Grants',
    'Edu. Materials',
  ];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [14800, 7400, 4440, 2960],
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
  public doughnutChartType: ChartType = 'doughnut';
  public tableData = [
    {
      id: 1,
      recipient: 'Foreigner Abu',
      category: 'Stipends',
      amountAllocated: 10000,
      dateAllocated: new Date(),
      dateDisbursed: new Date(),
      status: 'Pending',
    },
    {
      id: 2,
      recipient: 'James Bond',
      category: 'Edu. Materials',
      amountAllocated: 7585,
      dateAllocated: new Date(),
      dateDisbursed: new Date(),
      status: 'Approved',
    },
  ];
  public readonly displayedColumns: string[] = [
    'recipient',
    'category',
    'amountAllocated',
    'dateAllocated',
    'dateDisbursed',
    'status',
  ];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private breakpointObserver = inject(BreakpointObserver);

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1, id: 1 },
          { title: 'Card 2', cols: 1, rows: 1, id: 2 },
          { title: 'Card 3', cols: 1, rows: 1, id: 3 },
          { title: 'Card 4', cols: 1, rows: 1, id: 4 },
        ];
      }

      return [
        {
          title: 'Funds allocated',
          cols: 1,
          rows: 1,
          id: 1,
        },
        {
          title: 'Funds disbursed',
          cols: 1,
          rows: 1,
          id: 2,
        },
        {
          title: 'Students supported',
          cols: 1,
          rows: 1,
          id: 3,
        },
        {
          title: 'Funding distribution',
          cols: 1,
          rows: 3,
          id: 4,
        },
        {
          title: 'Total Funding Disbursed Over Time',
          cols: 2,
          rows: 3,
          id: 5,
        },
        {
          title: 'Users',
          cols: 3,
          rows: 3,
          id: 6,
        },
      ];
    })
  );
}
