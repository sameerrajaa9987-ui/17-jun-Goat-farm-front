export interface FarmReport {
  total: number;
  active: number;
  sick: number;
  sold: number;
  deceased: number;
  farmOwned: number;
  adPali: number;
  male: number;
  female: number;
  byBreed: { breed: string; count: number }[];
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface FinancialReport {
  income: number;
  expense: number;
  net: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  adPaliIncome: number;
  salesRevenue: number;
  monthly: MonthlyPoint[];
  outstanding: number;
  collected: number;
}

export interface OperationalReport {
  tasksToday: number;
  awaitingApproval: number;
  approvedTasks: number;
  vaccinations: number;
  dewormings: number;
  overdueHealth: number;
  activeStaff: number;
}

export interface Overview {
  farm: FarmReport;
  financial: FinancialReport;
  operational: OperationalReport;
}
