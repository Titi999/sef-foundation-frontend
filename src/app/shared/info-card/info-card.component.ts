import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitleGroup,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [FormsModule, MatButton, MatIcon, MatCardModule],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss',
})
export class InfoCardComponent {
  @Input()
  title!: string;

  @Input()
  viewMode = false;

  toggleMode() {
    this.viewMode = !this.viewMode;
  }
}
