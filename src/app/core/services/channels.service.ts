import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Channel {
  id: string;
  language: string;
  name: string;
  voice: string;
  voiceRate: string;
  voicePitch: string;
  youtubeClientId?: string;
  youtubeClientSecret?: string;
  youtubeRedirectUri?: string;
  youtubeCredentialsPath?: string;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeTokenExpiry?: number;
  youtubeRefreshTokenExpiresIn?: number;
  youtubeTokenType?: string;
  youtubeScope?: string;
  enabled: boolean;
  cronSchedule: string;
  subtitleColor: string;
  subtitleOutlineColor: string;
  fontSize: number;
  maxCharsPerLine: number;
  videoWidth: number;
  videoHeight: number;
  videoFps: number;
  videoMaxDuration: number;
  usePexelsVideos: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelDto {
  language: string;
  name: string;
  voice: string;
  voiceRate?: string;
  voicePitch?: string;
  youtubeClientId?: string;
  youtubeClientSecret?: string;
  youtubeRedirectUri?: string;
  youtubeCredentialsPath?: string;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeTokenExpiry?: number;
  youtubeRefreshTokenExpiresIn?: number;
  youtubeTokenType?: string;
  youtubeScope?: string;
  enabled?: boolean;
  cronSchedule?: string;
  subtitleColor?: string;
  subtitleOutlineColor?: string;
  fontSize?: number;
  maxCharsPerLine?: number;
  videoWidth?: number;
  videoHeight?: number;
  videoFps?: number;
  videoMaxDuration?: number;
  usePexelsVideos?: boolean;
}

export type UpdateChannelDto = Partial<CreateChannelDto>;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/channels`;

  getChannels(): Observable<Channel[]> {
    return this.http
      .get<ApiResponse<Channel[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  getChannel(id: string): Observable<Channel> {
    return this.http
      .get<ApiResponse<Channel>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createChannel(channel: CreateChannelDto): Observable<Channel> {
    return this.http
      .post<ApiResponse<Channel>>(this.apiUrl, channel)
      .pipe(map((response) => response.data));
  }

  updateChannel(id: string, channel: UpdateChannelDto): Observable<Channel> {
    return this.http
      .put<ApiResponse<Channel>>(`${this.apiUrl}/${id}`, channel)
      .pipe(map((response) => response.data));
  }

  deleteChannel(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }
}
