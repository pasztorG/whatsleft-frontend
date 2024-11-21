import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FinancialService } from '../../services/financial.service';

enum FinancialType {
  Income = 'Income',
  Expense = 'Expense'
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <div class="modal-overlay" *ngIf="isVisible">
      <div class="modal-content">
        <form class="transaction-form" (ngSubmit)="onSubmit()" (click)="onFormClick($event)">
          <h2>{{ editMode ? 'Edit' : 'Add' }} Transaction</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="amount">Amount</label>
              <input type="number" id="amount" name="amount" [(ngModel)]="transaction.amount" required>
            </div>
            
            <div class="form-group">
              <label for="type">Type</label>
              <select id="type" name="type" [(ngModel)]="transaction.type" (ngModelChange)="transaction.categoryName = ''" required>
                <option [ngValue]="FinancialType.Income">Income</option>
                <option [ngValue]="FinancialType.Expense">Expense</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category</label>
              <select id="category" name="category" [(ngModel)]="transaction.categoryName" required>
                <option value="">Select a category</option>
                <option *ngFor="let category of getCategories()" [value]="category">
                  {{category}}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="date">Date</label>
              <input type="date" id="date" name="date" 
                     [ngModel]="transaction.date | date:'yyyy-MM-dd'" 
                     (ngModelChange)="transaction.date = $event"
                     required>
            </div>
          </div>
        
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" [(ngModel)]="transaction.description"></textarea>
          </div>
        
          <div class="form-row actions">
            <div class="checkbox-group">
              <input type="checkbox" id="isRegular" name="isRegular" [(ngModel)]="transaction.isRegular">
              <label for="isRegular">Regular Transaction</label>
            </div>
            <div class="button-group">
              <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
              <button type="submit" class="btn-submit">{{ editMode ? 'Update' : 'Add' }} Transaction</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
    }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
    }

    input, select, textarea {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .actions {
      justify-content: space-between;
      align-items: center;
    }

    .button-group {
      display: flex;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-cancel {
      background: #f0f0f0;
    }

    .btn-submit {
      background: #007bff;
      color: white;
    }

    .btn-submit:hover {
      background: #0056b3;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    input[type="checkbox"] {
      width: auto;
    }
  `]
})
export class TransactionFormComponent implements OnInit, OnChanges {
  @Input() editMode = false;
  @Input() transactionToEdit: any = null;
  @Output() close = new EventEmitter<boolean>();

  private _isVisible = false;

  @Input() set isVisible(value: boolean) {
    if (!value) {
      this.resetTransaction();
    }
    this._isVisible = value;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }

  transaction: any = {
    amount: 0,
    categoryName: '',
    type: FinancialType.Income,
    description: '',
    date: new Date(),
    isRegular: false
  };

  ngOnInit() {
    this.loadTransactionData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionToEdit'] && this.transactionToEdit) {
      this.loadTransactionData();
    }
  }

  private loadTransactionData() {
    if (this.editMode && this.transactionToEdit) {
      this.transaction = {
        amount: this.transactionToEdit.amount,
        categoryName: this.transactionToEdit.categoryName || this.transactionToEdit.category?.name,
        type: this.transactionToEdit.type,
        description: this.transactionToEdit.description,
        date: new Date(this.transactionToEdit.date),
        isRegular: this.transactionToEdit.isRegular
      };
    }
  }

  private resetTransaction() {
    if (!this.editMode) {
      this.transaction = {
        amount: 0,
        categoryName: '',
        type: FinancialType.Income,
        description: '',
        date: new Date(),
        isRegular: false
      };
    }
  }

  FinancialType = FinancialType;
  financialTypes = Object.values(FinancialType);
  
  incomeCategories = [
    "Salary/Wages",
    "Bonuses",
    "Freelance Income",
    "Rental Income",
    "Investment Income",
    "Government Benefits",
    "Gifts",
    "Side Hustles"
  ];

  expenseCategories = [
    "Housing Costs",
    "Utilities",
    "Groceries",
    "Car Expenses",
    "Public Transport",
    "Insurance",
    "Healthcare",
    "Debt Payments",
    "Education",
    "Entertainment",
    "Savings/Investments"
  ];

  constructor(
    private financialService: FinancialService
  ) {}

  onSubmit(): void {
    const transactionToSend = {
      ...this.transaction,
      date: new Date(this.transaction.date).toISOString()
    };

    if (this.editMode && this.transactionToEdit) {
      this.financialService.updateFinancialData(this.transactionToEdit.id, transactionToSend)
        .subscribe({
          next: (response) => {
            this.close.emit(true);
          },
          error: (error) => {
            console.error('Error updating transaction:', error);
          }
        });
    } else {
      this.financialService.postFinancialData(transactionToSend)
        .subscribe({
          next: (response) => {
            this.close.emit(true);
          },
          error: (error) => {
            console.error('Error saving transaction:', error);
          }
        });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }

  getCategories(): string[] {
    return this.transaction.type === FinancialType.Income 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  onFormClick(event: MouseEvent) {
    event.stopPropagation();
  }
}