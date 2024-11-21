import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';

interface Transaction {
  date: Date;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
}

@Component({
  selector: 'app-daily-spending-chart',
  standalone: true,
  imports: [NgxChartsModule],
  template: `
    <div class="daily-spending-chart">
      <h3>Daily Expenses</h3>
      <div *ngIf="chartData && chartData.length > 0; else noData">
        <ngx-charts-line-chart
          [view]="view"
          [results]="chartData"
          [gradient]="gradient"
          [xAxis]="true"
          [yAxis]="true"
          [legend]="true"
          [showXAxisLabel]="true"
          [showYAxisLabel]="true"
          [xAxisLabel]="'Day'"
          [yAxisLabel]="'Amount ($)'"
          [timeline]="false"
          [scheme]="colorScheme"
          [autoScale]="true">
        </ngx-charts-line-chart>
      </div>
      <ng-template #noData>
        <p class="no-data">No expense data available</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .daily-spending-chart {
      margin-top: 2rem;
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-height: 450px;
    }

    :host ::ng-deep .ngx-charts {
      fill: #2c3e50;
    }

    h3 {
      margin-bottom: 1.5rem;
      color: #2c3e50;
      font-weight: 500;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class DailySpendingChartComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() view: [number, number] = [700, 400];
  @Input() gradient: boolean = true;
  @Input() xAxis: boolean = true;
  @Input() yAxis: boolean = true;
  @Input() showLegend: boolean = true;
  @Input() timeline: boolean = false;

  chartData: any[] = [];

  colorScheme: Color = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  } as Color;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.transactions || this.transactions.length === 0) {
      this.chartData = [];
      return;
    }

    const expenses = this.transactions.filter(t => t.type === 'Expense');
    if (expenses.length === 0) {
      this.chartData = [];
      return;
    }

    const categories = [...new Set(expenses.map(t => t.category))];
    if (categories.length === 0) {
      this.chartData = [];
      return;
    }

    this.chartData = categories.map(category => {
      const categoryExpenses = expenses.filter(t => t.category === category);
      const series = this.getDailyTotals(categoryExpenses);
      
      // Ensure we have data for the series
      if (series.length === 0) {
        return {
          name: category,
          series: [{name: '0', value: 0}] // Default value to prevent null
        };
      }

      return {
        name: category,
        series: series
      };
    });

    // Add console log to debug
    console.log('Chart Data:', this.chartData);
  }

  private getDailyTotals(transactions: Transaction[]): any[] {
    const dailyTotals: any[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // Last 7 days

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const total = Math.abs(this.calculateDayTotal(transactions, new Date(date)));
      dailyTotals.push({
        name: date.getDate().toString(),
        value: total || 0 // Ensure we never pass null
      });
    }

    return dailyTotals;
  }

  private calculateDayTotal(transactions: Transaction[], date: Date): number {
    return transactions
      .filter(t => t.date.toDateString() === date.toDateString())
      .reduce((total, t) => total + t.amount, 0);
  }
} 