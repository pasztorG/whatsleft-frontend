import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../home/header/header.component';
import { CommonModule } from '@angular/common';
import { FinancialService } from '../services/financial.service';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  date: string;
  category: {
    id: string;
    name: string;
  };
  isRegular: boolean;
}

interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;
  regularIncome = 0;
  regularExpenses = 0;
  monthlyStats: MonthlyStats[] = [];
  highestIncomeMonth: MonthlyStats | null = null;
  lowestIncomeMonth: MonthlyStats | null = null;
  highestExpenseMonth: MonthlyStats | null = null;
  lowestExpenseMonth: MonthlyStats | null = null;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];

  constructor(private financialService: FinancialService) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 4; year <= currentYear; year++) {
      this.availableYears.push(year);
    }
  }

  ngOnInit() {
    this.loadYearData(this.selectedYear);
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadYearData(year);
  }

  private loadYearData(year: number) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    this.financialService.getFinancialDataByDateRange(startDate, endDate)
      .subscribe({
        next: (transactions) => {
          this.resetTotals();
          this.calculateTotals(transactions);
          this.calculateMonthlyStats(transactions);
        },
        error: (error) => {
          console.error('Error loading financial data:', error);
        }
      });
  }

  private resetTotals() {
    this.totalIncome = 0;
    this.totalExpenses = 0;
    this.balance = 0;
    this.regularIncome = 0;
    this.regularExpenses = 0;
    this.monthlyStats = [];
  }

  private calculateTotals(transactions: Transaction[]) {
    transactions.forEach(transaction => {
      if (transaction.type === 'Income') {
        this.totalIncome += transaction.amount;
        if (transaction.isRegular) {
          this.regularIncome += transaction.amount;
        }
      } else {
        this.totalExpenses += transaction.amount;
        if (transaction.isRegular) {
          this.regularExpenses += transaction.amount;
        }
      }
    });
    this.balance = this.totalIncome - this.totalExpenses;
  }

  private calculateMonthlyStats(transactions: Transaction[]) {
    const monthlyData = new Map<string, MonthlyStats>();

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          income: 0,
          expenses: 0,
          balance: 0
        });
      }

      const stats = monthlyData.get(monthKey)!;
      if (transaction.type === 'Income') {
        stats.income += transaction.amount;
      } else {
        stats.expenses += transaction.amount;
      }
      stats.balance = stats.income - stats.expenses;
    });

    this.monthlyStats = Array.from(monthlyData.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    this.highestIncomeMonth = this.monthlyStats.reduce((max, curr) => {
      if (!max || curr.income > max.income) {
        return curr;
      }
      return max;
    }, this.monthlyStats[0] || null);

    this.lowestIncomeMonth = this.monthlyStats.reduce((min, curr) => {
      if (!min || curr.income < min.income) {
        return curr;
      }
      return min;
    }, this.monthlyStats[0] || null);

    this.highestExpenseMonth = this.monthlyStats.reduce((max, curr) => {
      if (!max || curr.expenses > max.expenses) {
        return curr;
      }
      return max;
    }, this.monthlyStats[0] || null);

    this.lowestExpenseMonth = this.monthlyStats.reduce((min, curr) => {
      if (!min || curr.expenses < min.expenses) {
        return curr;
      }
      return min;
    }, this.monthlyStats[0] || null);
  }
}
