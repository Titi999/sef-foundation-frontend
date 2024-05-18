import { Component, EventEmitter, Inject } from '@angular/core';
import {
  ActionModalColor,
  ActionModalData,
  ActionModalIllustration,
  ActionType,
} from '@app/shared/action-modal/action-modal.type';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [MatButton, MatDialogClose],
  templateUrl: './action-modal.component.html',
  styleUrl: './action-modal.component.scss',
})
export class ActionModalComponent {
  actionIllustration!: ActionModalIllustration;
  title!: string;
  color!: ActionModalColor;
  subtext!: string;
  actionType!: ActionType;
  decisionButton!: string;
  decisionEmitter = new EventEmitter<void>();
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ActionModalData) {
    this.actionIllustration = data.actionIllustration;
    this.title = data.title;
    this.color = data.actionColor;
    this.subtext = data.subtext;
    this.actionType = data.actionType;
    if (data.decisionText) {
      this.decisionButton = data.decisionText;
    }
  }

  decision() {
    this.decisionEmitter.emit();
  }
}
