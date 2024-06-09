import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { ChartType } from 'chart.js';
import Chart from 'chart.js/auto';
import { ngxCsv } from 'ngx-csv';

interface Category {
  value: string;
  viewValue: string;
}

interface Term {
  label: string;
  value: string;
}

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    InfoCardComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatProgressSpinner,
    MatSelect,
    MatOption,
    MatList,
    MatListItem,
    MatDatepickerModule,
    MatButton,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss',
})
export class FinancialReportComponent implements OnInit {
  selectedTerm!: string;
  selectedValue!: string;
  public startMinDate = new Date();
  public barChartType: ChartType = 'bar';
  chart: unknown = [];
  data!: [];

  financialReportForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    term: ['', Validators.required],
    category: ['', Validators.required],
  });

  terms: Term[] = [
    { label: 'jan-apr', value: 'Jan - Apr' },
    { label: 'jun-aug', value: 'Jun - Aug' },
    { label: 'sep-dec', value: 'Sep - Dec' },
  ];

  categories: Category[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.budgetAndDisbursementBarChart();
  }

  private budgetAndDisbursementBarChart() {
    this.chart = new Chart('MyChart', {
      type: 'bar', //this denotes tha type of chart

      data: {
        // values on X-Axis
        labels: [
          'PRI.',
          'JHS.',
          'SHS.',
          'VOC.',
          'HND.',
          '1st DEG.',
          '2nd DEG.',
          'PROF.',
        ],
        datasets: [
          {
            label: 'Budget',
            data: ['667', '576', '572', '79', '92', '574', '573', '576'],
            backgroundColor: '#1F6587',
            borderRadius: 5,
          },
          {
            label: 'Disbursement',
            data: ['542', '542', '536', '327', '17', '10.00', '538', '541'],
            backgroundColor: '#C5E7FF',
            borderRadius: 5,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
  }

  downloadCSV() {
    new ngxCsv(this.data, 'Budgets', {
      // Appropriate headers needs to be provided for CSV
      headers: [],
    });
  }
}
