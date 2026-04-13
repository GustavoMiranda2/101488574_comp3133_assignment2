//Name: Gustavo Miranda
//Student ID: 101488574

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeBloom } from '../../../core/models/orchid-contracts';
import { OrchidGraphql } from '../../../core/services/orchid-graphql';
import { SessionNest } from '../../../core/services/session-nest';
import { PlumSalaryPipe } from '../../../shared/pipes/plum-salary-pipe';

@Component({
  selector: 'app-employee-profile',
  imports: [CommonModule, RouterLink, PlumSalaryPipe],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css'
})
export class EmployeeProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orchidGraphql = inject(OrchidGraphql);
  private readonly sessionNest = inject(SessionNest);

  employeeBloom: EmployeeBloom | null = null;
  pageFlash = '';
  isPageBusy = true;
  private employeeKey = '';

  ngOnInit(): void {
    this.employeeKey = this.route.snapshot.paramMap.get('id') || '';
    void this.loadEmployee();
  }

  get signedUserName(): string {
    return this.sessionNest.currentUser()?.username || 'User';
  }

  async loadEmployee(): Promise<void> {
    this.isPageBusy = true;

    try {
      const employeeEnvelope = await this.orchidGraphql.fetchEmployee(this.employeeKey);

      if (!employeeEnvelope.success || !employeeEnvelope.employee) {
        this.pageFlash = employeeEnvelope.message || 'Employee not found.';
        return;
      }

      this.employeeBloom = employeeEnvelope.employee;
    } catch (error) {
      this.pageFlash = error instanceof Error ? error.message : 'Unable to load the employee.';
    } finally {
      this.isPageBusy = false;
    }
  }

  async eraseEmployee(): Promise<void> {
    if (!this.employeeBloom) {
      return;
    }

    const keepsGoing = window.confirm(
      `Delete ${this.employeeBloom.first_name} ${this.employeeBloom.last_name} from the roster?`
    );

    if (!keepsGoing) {
      return;
    }

    try {
      const deleteBloom = await this.orchidGraphql.deleteEmployee(this.employeeBloom._id);

      if (!deleteBloom.success) {
        this.pageFlash = deleteBloom.message || 'Unable to delete the employee.';
        return;
      }

      await this.router.navigateByUrl('/employees');
    } catch (error) {
      this.pageFlash = error instanceof Error ? error.message : 'Unable to delete the employee.';
    }
  }

  async goLogout(): Promise<void> {
    this.sessionNest.clearNest();
    await this.router.navigateByUrl('/login');
  }
}
