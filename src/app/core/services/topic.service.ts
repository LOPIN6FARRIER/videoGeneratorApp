import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TopicRecord {
  id: string;
  executionId: string;
  title: string;
  description: string;
  imageKeywords: string;
  videoKeywords: string;
  openaiModel: string;
  openaiTokensUsed: number;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PaginatedTopics {
  topics: TopicRecord[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/topics`;

  getTopics(limit: number = 20, offset: number = 0): Observable<PaginatedTopics> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ApiResponse<TopicRecord[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        topics: response.data,
        total: response.total || 0,
      })),
    );
  }
}
