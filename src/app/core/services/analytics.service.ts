import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AnalyticsRecord {
  id: string;
  uploadId: string;
  views: number;
  likes: number;
  comments: number;
  watchTimeHours: number;
  ctrPercent: number;
  avgViewDurationSeconds: number;
  recordedAt: Date;
  videoTitle?: string;
  channel?: string;
  language?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalWatchTimeHours: number;
  avgCtrPercent: number;
  topVideos: Array<{
    title: string;
    views: number;
    likes: number;
    channel: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PaginatedAnalytics {
  analytics: AnalyticsRecord[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  getAnalytics(limit: number = 50, offset: number = 0): Observable<PaginatedAnalytics> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ApiResponse<AnalyticsRecord[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        analytics: response.data,
        total: response.total || 0,
      })),
    );
  }

  getSummary(): Observable<AnalyticsSummary> {
    return this.http
      .get<ApiResponse<AnalyticsSummary>>(`${this.apiUrl}/summary`)
      .pipe(map((response) => response.data));
  }
}
