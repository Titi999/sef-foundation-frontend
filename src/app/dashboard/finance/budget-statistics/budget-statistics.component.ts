import { Component, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-budget-statistics',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatIconButton,
    MatIcon,
    RouterOutlet,
  ],
  templateUrl: './budget-statistics.component.html',
  styleUrl: './budget-statistics.component.scss',
})
export class BudgetStatisticsComponent implements OnInit {
  showGridContainer = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

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
          title: 'Budget allocated',
          cols: 1,
          rows: 1,
          id: 1,
        },
        {
          title: 'Budget Utilized',
          cols: 1,
          rows: 1,
          id: 2,
        },
        {
          title: 'Surplus/Deficit',
          cols: 1,
          rows: 1,
          id: 3,
        },
      ];
    })
  );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly location: Location,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url === '/dashboard/finance/financial-report') {
      this.showGridContainer = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
