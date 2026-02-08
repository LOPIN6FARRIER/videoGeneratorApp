import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PipelineExecution {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  status: 'running' | 'completed' | 'failed';
  durationSeconds: number | null;
  errorMessage: string | null;
}

export interface PipelineExecutionDetail extends PipelineExecution {
  topic?: {
    id: string;
    title: string;
    description: string;
    imageKeywords: string;
    videoKeywords: string;
  };
  scripts?: Array<{
    id: string;
    language: string;
    title: string;
    wordCount: number;
    estimatedDuration: number;
  }>;
  videos?: Array<{
    id: string;
    language: string;
    filePath: string;
    durationSeconds: number;
    fileSizeMb: number;
  }>;
  uploads?: Array<{
    id: string;
    youtubeVideoId: string;
    youtubeUrl: string;
    channel: string;
    title: string;
    privacyStatus: string;
  }>;
  resourceUsage?: {
    openaiTokensTotal: number;
    openaiCostUsd: number;
    processingTimeSeconds: number;
    edgeTtsDurationSeconds: number;
    ffmpegDurationSeconds: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PaginatedExecutions {
  executions: PipelineExecution[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PipelineService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pipeline`;

  getExecutions(limit: number = 20, offset: number = 0): Observable<PaginatedExecutions> {
    const params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ApiResponse<PipelineExecution[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        executions: response.data,
        total: response.total || 0,
      })),
    );
  }

  getExecutionById(id: string): Observable<PipelineExecutionDetail> {
    return this.http
      .get<ApiResponse<PipelineExecutionDetail>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}
