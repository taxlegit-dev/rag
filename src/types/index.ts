export interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export interface SubUser {
  id: string;
  name: string;
  contactNumber: string;
  departmentId: string;
  department: Department;
  createdAt: string;
}

export interface Task {
  task: string;
  steps: {
    step_no: number;
    action: string;
    risk: string;
    mitigation: string;
  }[];
  makers?: string;
  checkers?: string;
  riskDescription?: string;
  riskRating?: string;
  fraudRisk?: string;
  financialStatementAssertionControl?: string;
  controlReference?: string;
  isOperationalFinancialKeyControl?: boolean;
  frequencyOfControl?: string;
  natureOfControl?: string;
  itApplicationUsed?: string;
  spocControlOwner?: string;
  controlAsIs?: string;
}

export interface GeneratedSOP {
  id?: string;
  process: string;
  subprocess: string;
  tasks: Task[];
  assignedSubUsers?: SubUser[];
}
