import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-rounded-input',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatPrefix,
    ReactiveFormsModule,
  ],
  templateUrl: './rounded-input.component.html',
  styleUrl: './rounded-input.component.scss',
})
export class RoundedInputComponent {
  @Input()
  placeholder: string = '';

  @Input()
  control!: FormControl;

  @Input()
  disabled: boolean = false;
}
