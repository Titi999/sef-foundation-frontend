import {
  Component,
  computed,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { getYearsDropDownValues } from '@app/libs/util';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-beneficiary-academics',
  standalone: true,
  imports: [
    MatSelect,
    MatOption,
    MatOption,
    MatFormFieldModule,
    ReactiveFormsModule,
    BaseChartDirective,
  ],
  templateUrl: './beneficiary-academics.component.html',
  styleUrl: './beneficiary-academics.component.scss',
})
export class BeneficiaryAcademicsComponent {
  public yearControl = new FormControl('');
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
  private data: WritableSignal<number[]> = signal([]);
  public beneficiaryData: Signal<ChartConfiguration['data']> = computed(() => {
    return {
      datasets: [
        {
          data: [1, 3, 16],
          label: 'Academic performance for position per year',
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)',
          pointStyle: 'line',
        },
      ],
      labels: ['2022', '2023', '2024'],
    };
  });
  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    plugins: {
      legend: { display: true },
    },
  };
  public lineChartType: ChartType = 'bar';
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
}
