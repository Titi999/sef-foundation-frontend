import {Component, OnInit, ViewChild} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatIconButton} from "@angular/material/button";
import {BreakpointObserver} from "@angular/cdk/layout";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {AuthService} from "../services/auth.service";
import {MatCardAvatar} from "@angular/material/card";
import {AvatarModule} from "ngx-avatars";
import {MatTooltip} from "@angular/material/tooltip";

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
    MatCardAvatar,
    AvatarModule,
    RouterLinkActive,
    RouterLink,
    MatTooltip
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile= true;
  isCollapsed = true;
  userName = this.authService.userName


  constructor(private observer: BreakpointObserver,
              private authService: AuthService) {}

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
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
}
