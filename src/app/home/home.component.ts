import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialDataComponent } from './financial-data/financial-data.component';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { HeaderComponent } from './header/header.component';
import { MonthlyDashboardComponent } from "./monthly-dashboard/monthly-dashboard.component";
import { FinancialService } from '../services/financial.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FinancialDataComponent, 
    TransactionFormComponent, 
    HeaderComponent, 
    MonthlyDashboardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  financialData: any[] = [];
  error: string = '';
  showTransactionModal = false;
  editMode = false;
  transactionToEdit: any = null;
  householdName: string = '';

  constructor(
    private financialService: FinancialService
  ) {
    this.householdName = localStorage.getItem('householdName') || '';
  }

  ngOnInit() {
    this.loadFinancialData();
  }

  loadFinancialData() {
    this.financialService.getFinancialDataThisMonth()
      .subscribe({
        next: (data) => {
          this.financialData = data;
        },
        error: (error) => {
          this.error = 'Error loading financial data';
          console.error('Error fetching financial data:', error);
        }
      });
  }

  openTransactionModal() {
    this.editMode = false;
    this.transactionToEdit = null;
    this.showTransactionModal = true;
  }

  onEditTransaction(transaction: any) {
    this.editMode = true;
    this.transactionToEdit = transaction;
    this.showTransactionModal = true;
  }

  onModalClose(result: boolean) {
    this.showTransactionModal = false;
    this.editMode = false;
    this.transactionToEdit = null;
    if (result) {
      this.loadFinancialData();
    }
  }

  onFinancialDataChange(event: any) {
    console.log('Data received in HomeComponent:', event);
    this.loadFinancialData();
  }
}
