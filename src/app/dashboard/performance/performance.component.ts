import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle,
} from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import {
  MatTable,
  MatHeaderCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatCellDef,
  MatCell,
} from '@angular/material/table';
import { classesList, statusFilters, typesList } from '@app/libs/constants';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { ngxCsv } from 'ngx-csv';
import { Subject, map } from 'rxjs';
import { AvatarModule } from 'ngx-avatars';

interface PerformanceType {
  id: string;
  recipient: string;
  grade: number;
  school: string;
  averageScore: string;
}

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    MatSelect,
    MatOption,
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatIconButton,
    MatCardModule,
    MatChipsModule,
    MatTable,
    MatSort,
    MatHeaderCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatCell,
    MatCellDef,
    RoundedInputComponent,
    MatButtonModule,
    MatMenuTrigger,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatRadioButton,
    MatRadioGroup,
    AvatarModule,
  ],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss',
})
export class PerformanceComponent {
  protected classList = classesList;
  protected typeList = typesList;
  private breakpointObserver = inject(BreakpointObserver);
  public searchValue = new FormControl('');
  public isLoadingResults = true;
  public data: PerformanceType[] = [
    {
      id: '1',
      recipient: 'Yaaya KK',
      grade: 12,
      school: 'Zion Educational Complex',
      averageScore: '87',
    },
    {
      id: '2',
      recipient: 'King Tilly',
      grade: 8,
      school: 'Good Shepherd School',
      averageScore: '92',
    },
    {
      id: '3',
      recipient: 'Ken Smith',
      grade: 10,
      school: 'Lagos Town M/A',
      averageScore: '69',
    },
  ];
  public readonly displayedColumns: string[] = [
    'recipient',
    'grade',
    'school',
    'averageScore',
  ];
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public statusControl = new FormControl('');
  public statusFilters = statusFilters;

  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1, id: 1 },
          { title: 'Card 2', cols: 1, rows: 1, id: 2 },
          { title: 'Card 3', cols: 1, rows: 1, id: 3 },
        ];
      }

      return [
        {
          title: 'Kofi Kankam',
          cols: 1,
          rows: 1,
          id: 1,
        },
        {
          title: 'Thomas Edison',
          cols: 1,
          rows: 1,
          id: 2,
        },
        {
          title: 'Daniel Bernoulli',
          cols: 1,
          rows: 1,
          id: 3,
        },
      ];
    })
  );

  onPaginationChange(event: PageEvent) {
    this.page.setValue(event.pageIndex + 1);
  }

  downloadCSV() {
    const data = this.data.map(performance => {
      return {
        id: performance.id,
        recipient: performance.recipient,
        grade: performance.grade,
        school: performance.school,
        averageScore: performance.averageScore,
      };
    });
    new ngxCsv(data, 'SEF Performance', {
      headers: ['ID', 'RECIPIENT', 'GRADE', 'SCHOOL', 'AVERAGE_SCORE'],
    });
  }
}
