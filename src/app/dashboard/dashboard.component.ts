import { Component, OnInit, ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { AvatarModule } from 'ngx-avatars';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '@app/auth/auth.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { UserRoles } from '@app/auth/auth.type';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    RouterOutlet,
    MatSidenav,
    MatIconButton,
    MatListItem,
    NgClass,
    NgOptimizedImage,
    AvatarModule,
    RouterLinkActive,
    RouterLink,
    MatTooltip,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
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
  ) {}

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
}
