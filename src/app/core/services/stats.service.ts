import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalChannels: number;
  totalVideos: number;
  totalExecutions: number;
  successRate: number;
  totalTokens: number;
  totalCostUSD: number;
  avgProcessingTime: number;
}

export interface RecentActivity {
  id: string;
  type: 'execution' | 'upload' | 'error';
  title: string;
  timestamp: Date;
  status?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/stats`;

  getStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  getRecentActivity(limit: number = 10): Observable<RecentActivity[]> {
    return this.http
      .get<ApiResponse<RecentActivity[]>>(`${this.apiUrl}/activity?limit=${limit}`)
      .pipe(map((response) => response.data));
  }
}
