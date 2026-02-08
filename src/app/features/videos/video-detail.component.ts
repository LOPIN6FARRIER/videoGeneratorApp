import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VideoService, VideoRecord } from '../../core/services/video.service';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (error()) {
        <div class="rounded-md bg-red-50 p-4">
          <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
        </div>
      }

      @if (video() && !isLoading()) {
        <div class="space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <a
                routerLink="/videos"
                class="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
              >
                ← Back to Videos
              </a>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ video()!.topic?.title || 'Video Details' }}
              </h1>
            </div>
            @if (video()!.upload) {
              <a
                [href]="video()!.upload!.youtubeUrl"
                target="_blank"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                View on YouTube
              </a>
            }
          </div>

          <!-- Main Info -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Video Information</h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Language</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {{
                        getLanguageColor(video()!.language)
                      }}"
                    >
                      {{ getLanguageLabel(video()!.language) }}
                    </span>
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Duration</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDuration(video()!.durationSeconds) }}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Resolution</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ video()!.width }}x{{ video()!.height }}px
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">File Size</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatFileSize(video()!.fileSizeMb) }}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Voice</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ video()!.audioVoice }}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Processing Time</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ video()!.processingTimeSeconds }}s
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Created At</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDate(video()!.createdAt) }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Topic Info -->
          @if (video()!.topic) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Topic</h3>
              </div>
              <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                <p class="text-sm text-gray-900">{{ video()!.topic!.description }}</p>
              </div>
            </div>
          }

          <!-- Files -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Files</h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Video File</dt>
                  <dd
                    class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs break-all"
                  >
                    {{ video()!.filePath }}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Audio File</dt>
                  <dd
                    class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs break-all"
                  >
                    {{ video()!.audioFilePath }}
                  </dd>
                </div>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Subtitles File</dt>
                  <dd
                    class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs break-all"
                  >
                    {{ video()!.subtitlesFilePath }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Upload Status -->
          @if (video()!.upload) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">YouTube Upload</h3>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Video ID</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                      {{ video()!.upload!.youtubeVideoId }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Channel</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ video()!.upload!.channel }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Privacy Status</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span
                        class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {{
                          getStatusColor(video()!.upload!.privacyStatus)
                        }}"
                      >
                        {{ video()!.upload!.privacyStatus }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class VideoDetailComponent implements OnInit {
  private readonly videoService = inject(VideoService);
  private readonly route = inject(ActivatedRoute);

  video = signal<VideoRecord | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVideo(id);
    }
  }

  private loadVideo(id: string): void {
    this.videoService.getVideoById(id).subscribe({
      next: (video) => {
        this.video.set(video);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading video:', err);
        this.error.set('Failed to load video details');
        this.isLoading.set(false);
      },
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(mb: number): string {
    return `${mb.toFixed(2)} MB`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getLanguageLabel(language: string): string {
    return language === 'es' ? 'Español' : 'English';
  }

  getLanguageColor(language: string): string {
    return language === 'es' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  }

  getStatusColor(status: string): string {
    if (status === 'public') return 'bg-green-100 text-green-800';
    if (status === 'private') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }
}
