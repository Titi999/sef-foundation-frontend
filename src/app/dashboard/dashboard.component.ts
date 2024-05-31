import { Component, OnInit, ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { AvatarModule } from 'ngx-avatars';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '@app/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { UserRoles } from '@app/auth/auth.type';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconButton } from '@angular/material/button';

interface FinanceNoe {
  name: string;
  routerLink: string;
  children?: FinanceNoe[];
}

const TREE_DATA: FinanceNoe[] = [
  {
    name: 'Finance',
    routerLink: 'finance',
    children: [
      { name: 'Budget Allocation', routerLink: 'finance/budget-allocation' },
      { name: 'Disbursements', routerLink: 'finance/disbursements' },
    ],
  },
];

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  routerLink: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbar,
    MatSidenavModule,
    MatNavList,
    MatIconModule,
    MatListItem,
    NgClass,
    NgOptimizedImage,
    AvatarModule,
    RouterModule,
    MatTooltip,
    MatMenuModule,
    MatTreeModule,
    MatIconButton,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private _transformer = (node: FinanceNoe, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      routerLink: node.routerLink,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;
  userName = this.authService.userName;
  protected readonly UserRoles = UserRoles;

  constructor(
    private observer: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe(screenSize => {
      this.isMobile = screenSize.matches;
    });
  }

  toggleMenu() {
    if (this.isMobile) {
      void this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      void this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }

  logout() {
    this.authService.logout().subscribe();
  }

  getUserRole(): UserRoles | undefined {
    return this.authService.role();
  }

  userId() {
    return this.authService.loggedInUser()?.user.id;
  }

  getFinanceActiveCSS(name: string) {
    return (
      this.router.url.startsWith('/dashboard/finance') && name === 'Finance'
    );
  }

  getOtherFinanceActiveCSS(name: string) {
    const dashboardUrl = '/dashboard/finance';
    switch (name) {
      case 'Budget Allocation':
        return this.router.url === `${dashboardUrl}/budget-allocation`;
      case 'Disbursements':
        return this.router.url === `${dashboardUrl}/disbursements`;
      default:
        return false;
    }
  }

  routeFinance(type: string) {
    switch (type) {
      case 'finance':
        return;
      case 'Budget Allocation':
        void this.router.navigate(['dashboard/finance/budget-allocation']);
        break;
      case 'Disbursements':
        void this.router.navigate(['dashboard/finance/disbursements']);
        break;
    }
  }
}
