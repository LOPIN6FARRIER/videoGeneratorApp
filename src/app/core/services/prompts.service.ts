import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Prompt {
  id: string;
  channel_id: string;
  type: 'topic' | 'script' | 'title' | 'description';
  name: string;
  prompt_text: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptDto {
  channel_id: string;
  type: 'topic' | 'script' | 'title' | 'description';
  name: string;
  prompt_text: string;
  enabled?: boolean;
}

export interface UpdatePromptDto {
  type?: 'topic' | 'script' | 'title' | 'description';
  name?: string;
  prompt_text?: string;
  enabled?: boolean;
}

export interface PaginatedPrompts {
  prompts: Prompt[];
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PromptsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prompts`;

  getPrompts(channelId?: string, type?: string, enabled?: boolean): Observable<PaginatedPrompts> {
    let params: any = {};
    if (channelId) params.channel_id = channelId;
    if (type) params.type = type;
    if (enabled !== undefined) params.enabled = enabled.toString();

    return this.http.get<ApiResponse<Prompt[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        prompts: response.data || [],
        total: response.total || 0,
      })),
    );
  }

  getPrompt(id: string): Observable<Prompt> {
    return this.http
      .get<ApiResponse<Prompt>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createPrompt(data: CreatePromptDto): Observable<Prompt> {
    return this.http
      .post<ApiResponse<Prompt>>(this.apiUrl, data)
      .pipe(map((response) => response.data));
  }

  updatePrompt(id: string, data: UpdatePromptDto): Observable<Prompt> {
    return this.http
      .put<ApiResponse<Prompt>>(`${this.apiUrl}/${id}`, data)
      .pipe(map((response) => response.data));
  }

  deletePrompt(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }
}
