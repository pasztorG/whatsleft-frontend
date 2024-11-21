import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  householdId: string;
  isRegular: boolean;
  type: 'Income' | 'Expense';
  description: string;
  amount: number;
  date: string;
  createdAt: string;
  name: string;
  category: Category;
}

interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  percentUsed: number;
  percentage: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentageOfTotal: number;
}

@Component({
  selector: 'app-monthly-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './monthly-dashboard.component.html',
  styleUrl: './monthly-dashboard.component.css'
})
export class MonthlyDashboardComponent implements OnChanges {
  @Input() financialData: Transaction[] = [];
  totalIncome: number = 0;
  totalExpenses: number = 0;
  balance: number = 0;
  topExpenseCategories: ExpenseCategory[] = [];
  monthlyIncome: number = 0;
  monthlyExpenses: number = 0;
  savingsRate: number = 0;
  budgetProgress: BudgetCategory[] = [];
  recentTransactions: Transaction[] = [];
  remainingBudget: number = 0;
  dailyAverage: number = 0;
  largestTransaction: number = 0;
  daysLeftInMonth: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['financialData']) {
      this.calculateTotals();
      this.findTopExpenseCategories();
      this.calculateMonthlyStats();
      this.updateBudgetProgress();
      this.loadRecentTransactions();
      this.calculateDailyStats();
    }
  }

  calculateTotals() {
    this.totalIncome = 0;
    this.totalExpenses = 0;

    this.financialData.forEach(item => {
      if (item.type === 'Income') {
        this.totalIncome += item.amount;
      } else if (item.type === 'Expense') {
        this.totalExpenses += item.amount;
      }
    });

    this.balance = this.totalIncome - this.totalExpenses;
  }

  findTopExpenseCategories() {
    const categoryTotals = new Map<string, number>();
    let totalExpenses = 0;

    // Calculate totals for each category and overall total
    this.financialData
      .filter(item => item.type === 'Expense')
      .forEach(expense => {
        const categoryName = expense.category.name;
        const currentTotal = categoryTotals.get(categoryName) || 0;
        categoryTotals.set(categoryName, currentTotal + expense.amount);
        totalExpenses += expense.amount;
      });

    // Convert to array with percentages
    this.topExpenseCategories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentageOfTotal: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  calculateMonthlyStats() {
    const currentMonth = new Date().getMonth();
    const monthlyTransactions = this.financialData.filter(t => 
      new Date(t.date).getMonth() === currentMonth
    );

    this.monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.savingsRate = Math.round((this.monthlyIncome - this.monthlyExpenses) / this.monthlyIncome * 100);

    // Calculate remaining budget (assuming a fixed monthly budget - you'll need to adjust this)
    const monthlyBudget = 5000; // Example value - replace with actual budget
    this.remainingBudget = monthlyBudget - this.monthlyExpenses;
  }

  calculateDailyStats() {
    const currentDate = new Date();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    this.daysLeftInMonth = lastDayOfMonth - currentDate.getDate();

    // Calculate daily average
    const currentDay = currentDate.getDate();
    this.dailyAverage = this.monthlyExpenses / currentDay;

    // Find largest transaction
    this.largestTransaction = Math.max(...this.financialData
      .filter(t => t.type === 'Expense')
      .map(t => t.amount));
  }

  updateBudgetProgress() {
    // Example budget categories - replace with actual data
    const budgetCategories = [
      { name: 'Car Expenses', limit: 2000 },
      { name: 'Insurance', limit: 800 },
      { name: 'Salary/Wages', limit: 400 },
      // ... add more categories as needed
    ];

    this.budgetProgress = budgetCategories.map(budget => {
      const spent = this.financialData
        .filter(t => t.type === 'Expense' && 
                    t.category.name === budget.name &&
                    new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: budget.name,
        spent: spent,
        budget: budget.limit,
        percentUsed: (spent / budget.limit) * 100,
        percentage: Math.min((spent / budget.limit) * 100, 100)
      };
    });
  }

  loadRecentTransactions() {
    // Will only load transactions from the actual financialData
    this.recentTransactions = this.financialData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
}
