import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  @Input() text: string = '';
  @Input() backgroundColor: 'blue' | 'green' | 'red' = 'blue';
  @Output() closeBtn = new EventEmitter<void>();

  onClose() {
    this.closeBtn.emit();
  }
}
