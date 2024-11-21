import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { FinancialService } from '../../services/financial.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-financial-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TransactionFormComponent,
    MatTabsModule
  ],
  templateUrl: './financial-data.component.html',
  styleUrls: ['./financial-data.component.css']
})
export class FinancialDataComponent {
  @Input() financialData: any[] = [];
  @Input() error: any;
  @Output() dataChange = new EventEmitter<void>();
  @Output() editTransaction = new EventEmitter<any>();

  isFormVisible = false;
  selectedTransaction: any = null;

  constructor(
    private financialService: FinancialService
  ) {}

  onModify(item: any) {
    console.log('Modifying item:', item);
    this.selectedTransaction = {...item};
    this.isFormVisible = true;
  }

  onFormClose(saved: boolean) {
    this.isFormVisible = false;
    this.selectedTransaction = null;
    if (saved) {
      this.dataChange.emit();
    }
  }

  onDelete(id: string) {
    this.financialService.deleteFinancialData(id).subscribe({
      next: () => {
        this.dataChange.emit();
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
      }
    });
  }

  getFilteredData(type: 'monthly' | 'regular'): any[] {
    if (!this.financialData) return [];
    
    return this.financialData.filter(item => {
      if (type === 'monthly') {
        return !item.isRegular; // Show in monthly tab if NOT regular
      } else {
        return item.isRegular; // Show in regular tab if IS regular
      }
    });
  }

  onModalBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop itself
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.isFormVisible = false;
      this.selectedTransaction = null;
    }
  }
}
