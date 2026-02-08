import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

export interface Channel {
  id: string;
  language: 'es' | 'en';
  name: string;
  voice: string;
  voice_rate: string;
  voice_pitch: string;
  group_id?: string | null;
  youtube_client_id?: string;
  youtube_client_secret?: string;
  youtube_redirect_uri?: string;
  youtube_credentials_path?: string;
  youtube_access_token?: string;
  youtube_refresh_token?: string;
  youtube_token_expiry?: number;
  youtube_refresh_token_expires_in?: number;
  youtube_token_type?: string;
  youtube_scope?: string;
  enabled: boolean;
  cron_schedule: string;
  subtitle_color: string;
  subtitle_outline_color: string;
  font_size: number;
  max_chars_per_line: number;
  video_width: number;
  video_height: number;
  video_fps: number;
  video_max_duration: number;
  use_pexels_videos: boolean;
  upload_as_short: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelDto {
  language: 'es' | 'en';
  name: string;
  voice: string;
  voiceRate?: string;
  voicePitch?: string;
  groupId?: string | null;
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
  uploadAsShort?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private api = inject(ApiService);

  channels = signal<Channel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  getChannels(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.get<Channel[]>('/channels').subscribe({
      next: (response) => {
        this.channels.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getChannel(id: string) {
    return this.api.get<Channel>(`/channels/${id}`);
  }

  createChannel(data: CreateChannelDto) {
    return this.api.post<Channel>('/channels', data);
  }

  updateChannel(id: string, data: Partial<CreateChannelDto>) {
    return this.api.put<Channel>(`/channels/${id}`, data);
  }

  deleteChannel(id: string) {
    return this.api.delete(`/channels/${id}`);
  }
}
