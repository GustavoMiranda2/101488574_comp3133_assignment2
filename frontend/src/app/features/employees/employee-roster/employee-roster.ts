//Name: Gustavo Miranda
//Student ID: 101488574

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeBloom } from '../../../core/models/orchid-contracts';
import { OrchidGraphql } from '../../../core/services/orchid-graphql';
import { SessionNest } from '../../../core/services/session-nest';
import { FocusViolet } from '../../../shared/directives/focus-violet';
import { PlumSalaryPipe } from '../../../shared/pipes/plum-salary-pipe';

@Component({
  selector: 'app-employee-roster',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FocusViolet, PlumSalaryPipe],
  templateUrl: './employee-roster.html',
  styleUrl: './employee-roster.css'
})
export class EmployeeRoster implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly orchidGraphql = inject(OrchidGraphql);
  private readonly sessionNest = inject(SessionNest);
  private readonly router = inject(Router);

  readonly searchRibbonForm = this.formBuilder.nonNullable.group({
    department: [''],
    designation: ['']
  });

  orchidRoster: EmployeeBloom[] = [];
  visibleRoster: EmployeeBloom[] = [];
  pageFlash = '';
  searchSummary = '';
  isRosterBusy = true;
  isFilterBusy = false;
  searchModeActive = false;

  ngOnInit(): void {
    void this.loadRoster();
  }

  get signedUserName(): string {
    return this.sessionNest.currentUser()?.username || 'User';
  }

  async loadRoster(): Promise<void> {
    this.isRosterBusy = true;

    try {
      const rosterBloom = await this.orchidGraphql.fetchRoster();
      this.orchidRoster = rosterBloom;
      this.visibleRoster = [...rosterBloom];
    } catch (error) {
      this.pageFlash = error instanceof Error ? error.message : 'Unable to load employees.';
    } finally {
      this.isRosterBusy = false;
    }
  }

  async runRibbonSearch(): Promise<void> {
    const ribbonDraft = this.searchRibbonForm.getRawValue();
    const trimmedDepartment = ribbonDraft.department.trim();
    const trimmedDesignation = ribbonDraft.designation.trim();

    this.pageFlash = '';

    if (!trimmedDepartment && !trimmedDesignation) {
      this.searchModeActive = false;
      this.searchSummary = '';
      this.visibleRoster = [...this.orchidRoster];
      return;
    }

    this.isFilterBusy = true;

    try {
      this.visibleRoster = await this.orchidGraphql.searchRoster({
        department: trimmedDepartment,
        designation: trimmedDesignation
      });
      this.searchModeActive = true;
      this.searchSummary = `Showing ${this.visibleRoster.length} matching employee(s).`;
    } catch (error) {
      this.pageFlash = error instanceof Error ? error.message : 'Unable to run the search.';
    } finally {
      this.isFilterBusy = false;
    }
  }

  clearRibbon(): void {
    this.searchRibbonForm.reset({
      department: '',
      designation: ''
    });
    this.searchModeActive = false;
    this.searchSummary = '';
    this.visibleRoster = [...this.orchidRoster];
    this.pageFlash = '';
  }

  async eraseEmployee(employeeBloom: EmployeeBloom): Promise<void> {
    const keepsGoing = window.confirm(
      `Delete ${employeeBloom.first_name} ${employeeBloom.last_name} from the roster?`
    );

    if (!keepsGoing) {
      return;
    }

    this.pageFlash = '';

    try {
      const deleteBloom = await this.orchidGraphql.deleteEmployee(employeeBloom._id);

      if (!deleteBloom.success) {
        this.pageFlash = deleteBloom.message || 'Unable to delete the employee.';
        return;
      }

      await this.loadRoster();
      this.pageFlash = deleteBloom.message;
    } catch (error) {
      this.pageFlash = error instanceof Error ? error.message : 'Unable to delete the employee.';
    }
  }

  async goLogout(): Promise<void> {
    this.sessionNest.clearNest();
    await this.router.navigateByUrl('/login');
  }
}
