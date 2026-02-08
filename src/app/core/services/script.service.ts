import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ScriptRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  language: string;
  title: string;
  narrative: string;
  description: string;
  tags: string[];
  estimatedDuration: number;
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

export interface PaginatedScripts {
  scripts: ScriptRecord[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/scripts`;

  getScripts(
    limit: number = 20,
    offset: number = 0,
    language?: string,
  ): Observable<PaginatedScripts> {
    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<ScriptRecord[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        scripts: response.data,
        total: response.total || 0,
      })),
    );
  }

  getScriptById(id: string): Observable<ScriptRecord> {
    return this.http
      .get<ApiResponse<ScriptRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}
