//Name: Gustavo Miranda
//Student ID: 101488574

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeDraft } from '../../../core/models/orchid-contracts';
import { OrchidGraphql } from '../../../core/services/orchid-graphql';
import { SessionNest } from '../../../core/services/session-nest';
import { FocusViolet } from '../../../shared/directives/focus-violet';

@Component({
  selector: 'app-employee-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FocusViolet],
  templateUrl: './employee-editor.html',
  styleUrl: './employee-editor.css'
})
export class EmployeeEditor implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly orchidGraphql = inject(OrchidGraphql);
  private readonly sessionNest = inject(SessionNest);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly genderChoices = ['Male', 'Female', 'Other'];
  readonly plumDraftForm = this.formBuilder.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', [Validators.required]],
    designation: ['', [Validators.required]],
    salary: ['', [Validators.required, Validators.min(1000)]],
    date_of_joining: ['', [Validators.required]],
    department: ['', [Validators.required]]
  });

  editorFlash = '';
  photoPreview = '';
  isEditMode = false;
  isPageBusy = false;
  isPhotoEncoding = false;
  employeeKey = '';
  private encodedPhotoTrail = '';

  ngOnInit(): void {
    this.employeeKey = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.employeeKey;

    if (this.isEditMode) {
      void this.loadEmployee();
    }
  }

  get signedUserName(): string {
    return this.sessionNest.currentUser()?.username || 'User';
  }

  get editorTitle(): string {
    return this.isEditMode ? 'Update employee' : 'Add employee';
  }

  async loadEmployee(): Promise<void> {
    this.isPageBusy = true;

    try {
      const employeeBloom = await this.orchidGraphql.fetchEmployee(this.employeeKey);

      if (!employeeBloom.success || !employeeBloom.employee) {
        this.editorFlash = employeeBloom.message || 'Employee not found.';
        return;
      }

      const rosterLeaf = employeeBloom.employee;
      this.plumDraftForm.setValue({
        first_name: rosterLeaf.first_name,
        last_name: rosterLeaf.last_name,
        email: rosterLeaf.email,
        gender: rosterLeaf.gender,
        designation: rosterLeaf.designation,
        salary: String(rosterLeaf.salary),
        date_of_joining: rosterLeaf.date_of_joining.slice(0, 10),
        department: rosterLeaf.department
      });
      this.photoPreview = rosterLeaf.employee_photo;
    } catch (error) {
      this.editorFlash = error instanceof Error ? error.message : 'Unable to load the employee.';
    } finally {
      this.isPageBusy = false;
    }
  }

  async onPhotoPicked(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    const photoFile = inputElement.files?.[0];

    if (!photoFile) {
      return;
    }

    if (!photoFile.type.startsWith('image/')) {
      this.editorFlash = 'Select a valid image file.';
      inputElement.value = '';
      return;
    }

    this.isPhotoEncoding = true;
    this.editorFlash = '';

    try {
      this.encodedPhotoTrail = await this.readPhotoAsBase64(photoFile);
      this.photoPreview = this.encodedPhotoTrail;
    } catch {
      this.editorFlash = 'Unable to read the selected image.';
    } finally {
      this.isPhotoEncoding = false;
    }
  }

  async submitEditor(): Promise<void> {
    this.editorFlash = '';

    if (this.plumDraftForm.invalid) {
      this.plumDraftForm.markAllAsTouched();
      return;
    }

    if (!this.isEditMode && !this.encodedPhotoTrail) {
      this.editorFlash = 'Employee photo is required.';
      return;
    }

    this.isPageBusy = true;

    try {
      const rawDraft = this.plumDraftForm.getRawValue();
      const orchidDraft: Partial<EmployeeDraft> = {
        first_name: rawDraft.first_name.trim(),
        last_name: rawDraft.last_name.trim(),
        email: rawDraft.email.trim().toLowerCase(),
        gender: rawDraft.gender,
        designation: rawDraft.designation.trim(),
        salary: Number(rawDraft.salary),
        date_of_joining: rawDraft.date_of_joining,
        department: rawDraft.department.trim()
      };

      if (this.encodedPhotoTrail) {
        orchidDraft.employee_photo = this.encodedPhotoTrail;
      }

      const employeeEnvelope = this.isEditMode
        ? await this.orchidGraphql.updateEmployee(this.employeeKey, orchidDraft)
        : await this.orchidGraphql.addEmployee(orchidDraft as EmployeeDraft);

      if (!employeeEnvelope.success || !employeeEnvelope.employee) {
        this.editorFlash = employeeEnvelope.message || 'Unable to save the employee.';
        return;
      }

      await this.router.navigate(['/employees', employeeEnvelope.employee._id]);
    } catch (error) {
      this.editorFlash = error instanceof Error ? error.message : 'Unable to save the employee.';
    } finally {
      this.isPageBusy = false;
    }
  }

  async goLogout(): Promise<void> {
    this.sessionNest.clearNest();
    await this.router.navigateByUrl('/login');
  }

  async cancelEditor(): Promise<void> {
    if (this.isEditMode) {
      await this.router.navigate(['/employees', this.employeeKey]);
      return;
    }

    await this.router.navigateByUrl('/employees');
  }

  fieldNote(
    controlName:
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'gender'
      | 'designation'
      | 'salary'
      | 'date_of_joining'
      | 'department'
  ): string {
    const orchidControl = this.plumDraftForm.controls[controlName];

    if (!orchidControl.touched && !orchidControl.dirty) {
      return '';
    }

    if (orchidControl.hasError('required')) {
      return `${this.readLabel(controlName)} is required.`;
    }

    if (orchidControl.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (controlName === 'salary' && orchidControl.hasError('min')) {
      return 'Salary must be at least 1000.';
    }

    return '';
  }

  private readLabel(
    controlName:
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'gender'
      | 'designation'
      | 'salary'
      | 'date_of_joining'
      | 'department'
  ): string {
    switch (controlName) {
      case 'first_name':
        return 'First name';
      case 'last_name':
        return 'Last name';
      case 'date_of_joining':
        return 'Joining date';
      default:
        return controlName.charAt(0).toUpperCase() + controlName.slice(1).replace('_', ' ');
    }
  }

  private readPhotoAsBase64(photoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const photoReader = new FileReader();
      photoReader.onload = () => resolve(String(photoReader.result || ''));
      photoReader.onerror = () => reject(new Error('File read error.'));
      photoReader.readAsDataURL(photoFile);
    });
  }
}
