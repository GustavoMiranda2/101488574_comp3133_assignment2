//Name: Gustavo Miranda
//Student ID: 101488574

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrchidGraphql } from '../../../core/services/orchid-graphql';
import { SessionNest } from '../../../core/services/session-nest';
import { FocusViolet } from '../../../shared/directives/focus-violet';

function matchingSecretsValidator(group: AbstractControl): ValidationErrors | null {
  const baseSecret = group.get('password')?.value;
  const echoSecret = group.get('confirmPassword')?.value;

  if (!baseSecret || !echoSecret) {
    return null;
  }

  return baseSecret === echoSecret ? null : { secretMismatch: true };
}

@Component({
  selector: 'app-signup-portal',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FocusViolet],
  templateUrl: './signup-portal.html',
  styleUrl: './signup-portal.css'
})
export class SignupPortal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly orchidGraphql = inject(OrchidGraphql);
  private readonly sessionNest = inject(SessionNest);
  private readonly router = inject(Router);

  readonly bloomForm = this.formBuilder.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [matchingSecretsValidator]
    }
  );

  entryFlash = '';
  isSendingBloom = false;

  ngOnInit(): void {
    if (this.sessionNest.hasLiveSession()) {
      void this.router.navigateByUrl('/employees');
    }
  }

  async submitBloom(): Promise<void> {
    this.entryFlash = '';

    if (this.bloomForm.invalid) {
      this.bloomForm.markAllAsTouched();
      return;
    }

    this.isSendingBloom = true;

    try {
      const bloomPayload = this.bloomForm.getRawValue();
      const authBloom = await this.orchidGraphql.signup({
        username: bloomPayload.username.trim(),
        email: bloomPayload.email.trim().toLowerCase(),
        password: bloomPayload.password
      });

      if (!authBloom.success || !authBloom.token || !authBloom.user) {
        this.entryFlash = authBloom.message || 'Unable to create the account.';
        return;
      }

      this.sessionNest.rememberBloom(authBloom);
      await this.router.navigateByUrl('/employees');
    } catch (error) {
      this.entryFlash = error instanceof Error ? error.message : 'Unable to create the account.';
    } finally {
      this.isSendingBloom = false;
    }
  }

  fieldNote(controlName: 'username' | 'email' | 'password' | 'confirmPassword'): string {
    const orchidControl = this.bloomForm.controls[controlName];

    if (!orchidControl.touched && !orchidControl.dirty) {
      return '';
    }

    if (orchidControl.hasError('required')) {
      return `${this.readLabel(controlName)} is required.`;
    }

    if (orchidControl.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (orchidControl.hasError('minlength')) {
      return controlName === 'username'
        ? 'Username must have at least 3 characters.'
        : 'Password must have at least 6 characters.';
    }

    if (
      controlName === 'confirmPassword' &&
      this.bloomForm.hasError('secretMismatch') &&
      orchidControl.touched
    ) {
      return 'Password confirmation must match.';
    }

    return '';
  }

  private readLabel(controlName: 'username' | 'email' | 'password' | 'confirmPassword'): string {
    switch (controlName) {
      case 'confirmPassword':
        return 'Password confirmation';
      case 'username':
        return 'Username';
      case 'email':
        return 'Email';
      default:
        return 'Password';
    }
  }
}
