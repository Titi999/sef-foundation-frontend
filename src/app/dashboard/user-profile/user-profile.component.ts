import {
  Component,
  OnInit,
  ViewChild,
  Injector,
  inject,
  afterNextRender,
} from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AvatarModule } from 'ngx-avatars';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    AvatarModule,
    MatCardModule,
    MatError,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    TextFieldModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  public userProfileForm!: FormGroup;

  private _injector = inject(Injector);

  @ViewChild('autosize') autosize!: CdkTextareaAutosize;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userProfileForm = this.fb.group({
      userId: [{ value: '12345', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      parentName: ['', Validators.required],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      parentPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      bio: ['', [Validators.required]],
    });

    this.userProfileForm.patchValue({
      userId: '12345',
      email: 'student@example.com',
      parentName: 'Parent Name',
      name: 'Student Name',
      phone: '1234567890',
      parentPhone: '0987654321',
      bio: 'Brown Lee is a dedicated Computer Science student at University fo Cape coast with a passion for software development and artificial intelligence. He is currently in his third year and has consistently maintained a high GPA of 3.8. John has received multiple scholarships for his academic excellence and is actively involved in various tech clubs and community service projects. In his free time, he enjoys coding, playing chess, and hiking.',
    });
  }

  public get userName() {
    return this.authService.userName();
  }

  public triggerResize() {
    // Wait for content to render, then trigger textarea resize.
    afterNextRender(
      () => {
        this.autosize.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      }
    );
  }
}
