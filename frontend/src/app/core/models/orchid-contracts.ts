//Name: Gustavo Miranda
//Student ID: 101488574

export interface UserBloom {
  _id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBloom {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo: string;
  created_at: string;
  updated_at: string;
}

export interface AuthBloom {
  success: boolean;
  message: string;
  token: string | null;
  user: UserBloom | null;
}

export interface EmployeeEnvelope {
  success: boolean;
  message: string;
  employee: EmployeeBloom | null;
}

export interface DeleteBloom {
  success: boolean;
  message: string;
}

export interface EmployeeDraft {
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo: string;
}

export interface SearchDraft {
  designation?: string;
  department?: string;
}

export interface SessionBloom {
  token: string;
  user: UserBloom;
  started_at: string;
}

export interface GraphIssue {
  message: string;
}

export interface GraphEnvelope<T> {
  data?: T;
  errors?: GraphIssue[];
}
