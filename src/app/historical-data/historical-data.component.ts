import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../home/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService } from '../services/financial.service';
import { MonthlyDashboardComponent } from '../home/monthly-dashboard/monthly-dashboard.component';
import { FinancialDataComponent } from '../home/financial-data/financial-data.component';
@Component({
  selector: 'app-historical-data',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, MonthlyDashboardComponent, FinancialDataComponent],
  templateUrl: './historical-data.component.html',
  styleUrl: './historical-data.component.css'
})
export class HistoricalDataComponent implements OnInit {
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];
  
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  financialData: any[] = [];
  error: string | null = null;

  householdName: string = '';

  constructor(private financialService: FinancialService) {
    this.householdName = localStorage.getItem('householdName') || '';
  }

  ngOnInit() {
    // Generate year options (e.g., last 10 years)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
    this.loadHistoricalData();
  }

  loadHistoricalData() {
    if (!this.selectedMonth || !this.selectedYear) {
      this.error = 'Please select a month and year';
      return;
    }

    // Format dates for the first and last day of the selected month
    const firstDay = `${this.selectedYear}-${this.padZero(this.selectedMonth)}-01`;
    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const lastDayStr = `${this.selectedYear}-${this.padZero(this.selectedMonth)}-${lastDay}`;

    this.financialService.getFinancialDataByDateRange(firstDay, lastDayStr)
      .subscribe({
        next: (data) => {
          this.financialData = data;
          this.error = null;
        },
        error: (err) => {
          this.error = `Failed to load historical data: ${err.message}`;
        }
      });
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
