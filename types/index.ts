// types.ts
export interface Question {
  id: string;
  questionText: string;
  inputType: "text" | "number" | "file" | "dropdown" | "radio" | "checkbox";
  options?: string[];
  isRequired: boolean;
  sortOrder?: number | null;
  createdAt: Date;
}

export type AnswerValue = string | number | File | string[] | null;

export interface Step {
  step_no: number;
  action: string;
  risk: string;
  mitigation: string;
}

export interface Task {
  task: string;
  makers: string;
  checkers: string;
  steps: Step[];

  // RCM fields (your existing fields)
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

  // REQUIRED based on fine-tune training data
  riskReference?: string; // R1 / R2 etc.
  risk?: string; // Short risk name
  financialAssertion?: string; // Exists in training
  operationalFinancial?: string; // "Operational" / "Financial"
  keyControl?: boolean | string; // Yes / No in training data
  existingProcess?: string; // Many training examples include it
}

export interface SubUser {
  id: string;
  name: string;
  contactNumber: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface GeneratedSOP {
  id?: string;
  process: string;
  subprocess: string;
  tasks: Task[];
  assignedSubUsers?: SubUser[];
}

export interface ProjectSession {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  answers?: Answer[];
  processes?: Process[];
  chatMessages?: ChatMessage[];
}

export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ChatMessage {
  id: string;
  projectSessionId: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface Answer {
  id: string;
  projectSessionId: string;
  questionId: string;
  answer: AnswerValue;
  createdAt: Date;
  question?: Question;
}

// New normalized models
export interface Process {
  id: string;
  projectSessionId: string;
  name: string;
  subprocesses?: Subprocess[];
  createdAt: Date;
}

export interface Subprocess {
  id: string;
  processId: string;
  name: string;
  tasks: Task[];
  subUserAssignments?: SubUserSOPAssignment[];
  createdAt: Date;
}

export interface SubUserSOPAssignment {
  id: string;
  subUserId: string;
  subprocessId: string;
  subUser?: SubUser;
  subprocess?: Subprocess;
  createdAt: Date;
}

// Legacy SOP interface - kept for backward compatibility
// This represents a flattened view of Process + Subprocess
export interface SOP {
  id: string;
  projectSessionId?: string;
  process: string;
  subprocess: string;
  tasks: Task[];
  createdAt: Date;
  assignedSubUsers?: SubUser[];
}
