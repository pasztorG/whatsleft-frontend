import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private apiUrl = 'http://localhost:5056/api'; // adjust port as needed

  constructor(private http: HttpClient) { }

  getFinancialDataThisMonth(): Observable<any> {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Fetching regular transactions for:', {
      from: yearStart.toISOString(),
      to: yearEnd.toISOString()
    });

    console.log('Fetching monthly transactions for:', {
      from: monthStart.toISOString(),
      to: monthEnd.toISOString()
    });

    const regularTransactions = this.http.get(`${this.apiUrl}/financialdata`, {
      headers,
      params: {
        from: yearStart.toISOString(),
        to: yearEnd.toISOString(),
        isRegular: 'true'
      }
    });

    const monthlyTransactions = this.http.get(`${this.apiUrl}/financialdata`, {
      headers,
      params: {
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
        isRegular: 'false'
      }
    });

    return new Observable(observer => {
      Promise.all([
        regularTransactions.toPromise(),
        monthlyTransactions.toPromise()
      ]).then(([regular, monthly]) => {
        console.log('Raw regular transactions:', regular);
        console.log('Raw monthly transactions:', monthly);
        
        // Filter regular transactions: must be regular AND within the year
        const validRegular = (regular as any[]).filter(item => {
          const itemDate = new Date(item.date);
          return item.isRegular === true && 
                 itemDate >= yearStart && 
                 itemDate <= yearEnd;
        });

        // Filter monthly transactions: must be non-regular AND within current month
        const validMonthly = (monthly as any[]).filter(item => {
          const itemDate = new Date(item.date);
          return item.isRegular === false && 
                 itemDate >= monthStart && 
                 itemDate <= monthEnd;
        });

        console.log('Filtered regular transactions:', validRegular);
        console.log('Filtered monthly transactions:', validMonthly);

        const combinedData = [...validRegular, ...validMonthly];
        observer.next(combinedData);
        observer.complete();
      }).catch(error => {
        console.error('Error fetching financial data:', error);
        observer.error(error);
      });
    });
  }

  postFinancialData(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/financialdata`, data, { headers });
  }

  getFinancialDataByDateRange(fromDate: string, toDate: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Create Date objects and ensure they're at the start/end of the day
    const from = new Date(fromDate);
    from.setUTCHours(0, 0, 0, 0);
    
    const to = new Date(toDate);
    to.setUTCHours(23, 59, 59, 999);

    const params = {
      from: from.toISOString(),
      to: to.toISOString()
    };

    console.log('Sending request with params:', params);
    return this.http.get(`${this.apiUrl}/financialdata`, { headers, params });
  }

  deleteFinancialData(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/financialdata/${id}`, { headers });
  }

  updateFinancialData(id: string, data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/financialdata/${id}`, data, { headers });
  }
}
