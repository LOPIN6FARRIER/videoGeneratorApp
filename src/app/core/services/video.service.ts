import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VideoRecord {
  id: string;
  scriptId: string;
  language: string;
  filePath: string;
  durationSeconds: number;
  width: number;
  height: number;
  fileSizeMb: number;
  audioVoice: string;
  audioFilePath: string;
  subtitlesFilePath: string;
  processingTimeSeconds: number;
  createdAt: Date;
  topic?: {
    title: string;
    description: string;
  };
  upload?: {
    youtubeVideoId: string;
    youtubeUrl: string;
    channel: string;
    privacyStatus: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface PaginatedVideos {
  videos: VideoRecord[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/videos`;

  getVideos(
    limit: number = 20,
    offset: number = 0,
    language?: string,
  ): Observable<PaginatedVideos> {
    let params = new HttpParams().set('limit', limit.toString()).set('offset', offset.toString());

    if (language) {
      params = params.set('language', language);
    }

    return this.http.get<ApiResponse<VideoRecord[]>>(this.apiUrl, { params }).pipe(
      map((response) => ({
        videos: response.data,
        total: response.total || 0,
      })),
    );
  }

  getVideoById(id: string): Observable<VideoRecord> {
    return this.http
      .get<ApiResponse<VideoRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  deleteVideo(id: string, deleteFiles: boolean = false): Observable<{ success: boolean }> {
    const params = new HttpParams().set('deleteFiles', deleteFiles.toString());
    return this.http
      .delete<ApiResponse<{ success: boolean }>>(`${this.apiUrl}/${id}`, { params })
      .pipe(map((response) => response.data));
  }
}
