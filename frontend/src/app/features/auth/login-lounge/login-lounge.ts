//Name: Gustavo Miranda
//Student ID: 101488574

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrchidGraphql } from '../../../core/services/orchid-graphql';
import { SessionNest } from '../../../core/services/session-nest';
import { FocusViolet } from '../../../shared/directives/focus-violet';

@Component({
  selector: 'app-login-lounge',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FocusViolet],
  templateUrl: './login-lounge.html',
  styleUrl: './login-lounge.css'
})
export class LoginLounge implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly orchidGraphql = inject(OrchidGraphql);
  private readonly sessionNest = inject(SessionNest);
  private readonly router = inject(Router);

  readonly authSparkForm = this.formBuilder.nonNullable.group({
    identity: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  entryFlash = '';
  isSendingSpark = false;

  ngOnInit(): void {
    if (this.sessionNest.hasLiveSession()) {
      void this.router.navigateByUrl('/employees');
    }
  }

  get signedUserHint(): string {
    return this.sessionNest.currentUser()?.username || 'guest';
  }

  async submitSpark(): Promise<void> {
    this.entryFlash = '';

    if (this.authSparkForm.invalid) {
      this.authSparkForm.markAllAsTouched();
      return;
    }

    this.isSendingSpark = true;

    try {
      const authBloom = await this.orchidGraphql.login(this.authSparkForm.getRawValue());

      if (!authBloom.success || !authBloom.token || !authBloom.user) {
        this.entryFlash = authBloom.message || 'Invalid login details.';
        return;
      }

      this.sessionNest.rememberBloom(authBloom);
      await this.router.navigateByUrl('/employees');
    } catch (error) {
      this.entryFlash = error instanceof Error ? error.message : 'Unable to sign in right now.';
    } finally {
      this.isSendingSpark = false;
    }
  }

  fieldNote(controlName: 'identity' | 'password'): string {
    const orchidControl = this.authSparkForm.controls[controlName];

    if (!orchidControl.touched && !orchidControl.dirty) {
      return '';
    }

    if (orchidControl.hasError('required')) {
      return controlName === 'identity'
        ? 'Username or email is required.'
        : 'Password is required.';
    }

    if (orchidControl.hasError('minlength')) {
      return 'Password must have at least 6 characters.';
    }

    return '';
  }
}
