//Name: Gustavo Miranda
//Student ID: 101488574

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { orchidEndpoint } from '../config/orchid-endpoint';
import {
  AuthBloom,
  DeleteBloom,
  EmployeeBloom,
  EmployeeDraft,
  EmployeeEnvelope,
  GraphEnvelope,
  SearchDraft
} from '../models/orchid-contracts';

@Injectable({
  providedIn: 'root',
})
export class OrchidGraphql {
  private readonly http = inject(HttpClient);

  async signup(signDraft: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthBloom> {
    const moonlitMutation = `
      mutation MoonlitSignup($input: SignupInput!) {
        signup(input: $input) {
          success
          message
          token
          user {
            _id
            username
            email
            created_at
            updated_at
          }
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ signup: AuthBloom }>(moonlitMutation, {
      input: signDraft
    });

    return bloomPacket.signup;
  }

  async login(identityDraft: {
    identity: string;
    password: string;
  }): Promise<AuthBloom> {
    const moonlitQuery = `
      query MoonlitLogin($username: String, $email: String, $password: String!) {
        login(username: $username, email: $email, password: $password) {
          success
          message
          token
          user {
            _id
            username
            email
            created_at
            updated_at
          }
        }
      }
    `;

    const usesEmailTrail = identityDraft.identity.includes('@');
    const bloomPacket = await this.sendBloom<{ login: AuthBloom }>(moonlitQuery, {
      username: usesEmailTrail ? null : identityDraft.identity.trim(),
      email: usesEmailTrail ? identityDraft.identity.trim().toLowerCase() : null,
      password: identityDraft.password
    });

    return bloomPacket.login;
  }

  async fetchRoster(): Promise<EmployeeBloom[]> {
    const rosterQuery = `
      query OrchidRoster {
        getAllEmployees {
          _id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
          created_at
          updated_at
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ getAllEmployees: EmployeeBloom[] }>(rosterQuery);
    return bloomPacket.getAllEmployees;
  }

  async fetchEmployee(employeeId: string): Promise<EmployeeEnvelope> {
    const profileQuery = `
      query OrchidProfile($eid: ID!) {
        searchEmployeeByEid(eid: $eid) {
          success
          message
          employee {
            _id
            first_name
            last_name
            email
            gender
            designation
            salary
            date_of_joining
            department
            employee_photo
            created_at
            updated_at
          }
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ searchEmployeeByEid: EmployeeEnvelope }>(
      profileQuery,
      { eid: employeeId }
    );

    return bloomPacket.searchEmployeeByEid;
  }

  async searchRoster(searchDraft: SearchDraft): Promise<EmployeeBloom[]> {
    const searchQuery = `
      query OrchidSearch($designation: String, $department: String) {
        searchEmployeeByDesignationOrDepartment(
          designation: $designation
          department: $department
        ) {
          _id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
          created_at
          updated_at
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{
      searchEmployeeByDesignationOrDepartment: EmployeeBloom[];
    }>(searchQuery, {
      designation: searchDraft.designation?.trim() || null,
      department: searchDraft.department?.trim() || null
    });

    return bloomPacket.searchEmployeeByDesignationOrDepartment;
  }

  async addEmployee(employeeDraft: EmployeeDraft): Promise<EmployeeEnvelope> {
    const addMutation = `
      mutation OrchidAddEmployee($input: EmployeeInput!) {
        addNewEmployee(input: $input) {
          success
          message
          employee {
            _id
            first_name
            last_name
            email
            gender
            designation
            salary
            date_of_joining
            department
            employee_photo
            created_at
            updated_at
          }
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ addNewEmployee: EmployeeEnvelope }>(addMutation, {
      input: employeeDraft
    });

    return bloomPacket.addNewEmployee;
  }

  async updateEmployee(
    employeeId: string,
    employeeDraft: Partial<EmployeeDraft>
  ): Promise<EmployeeEnvelope> {
    const updateMutation = `
      mutation OrchidRefreshEmployee($eid: ID!, $input: EmployeeUpdateInput!) {
        updateEmployeeByEid(eid: $eid, input: $input) {
          success
          message
          employee {
            _id
            first_name
            last_name
            email
            gender
            designation
            salary
            date_of_joining
            department
            employee_photo
            created_at
            updated_at
          }
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ updateEmployeeByEid: EmployeeEnvelope }>(
      updateMutation,
      {
        eid: employeeId,
        input: employeeDraft
      }
    );

    return bloomPacket.updateEmployeeByEid;
  }

  async deleteEmployee(employeeId: string): Promise<DeleteBloom> {
    const deleteMutation = `
      mutation OrchidDeleteEmployee($eid: ID!) {
        deleteEmployeeByEid(eid: $eid) {
          success
          message
        }
      }
    `;

    const bloomPacket = await this.sendBloom<{ deleteEmployeeByEid: DeleteBloom }>(
      deleteMutation,
      { eid: employeeId }
    );

    return bloomPacket.deleteEmployeeByEid;
  }

  private async sendBloom<T>(
    queryText: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    try {
      const envelope = await firstValueFrom(
        this.http.post<GraphEnvelope<T>>(orchidEndpoint, {
          query: queryText,
          variables
        })
      );

      const graphProblem = envelope.errors?.[0]?.message;
      if (graphProblem) {
        throw new Error(graphProblem);
      }

      if (!envelope.data) {
        throw new Error('GraphQL returned no data.');
      }

      return envelope.data;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const graphProblem = error.error?.errors?.[0]?.message;
        throw new Error(graphProblem || error.message || 'Unable to reach the backend.');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Unable to reach the backend.');
    }
  }
}
