import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PipelineService, PipelineExecutionDetail } from '../../core/services/pipeline.service';

@Component({
  selector: 'app-pipeline-detail',
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

      @if (execution() && !isLoading()) {
        <div class="space-y-6">
          <!-- Header -->
          <div>
            <a
              routerLink="/dashboard"
              class="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
            >
              ← Back to Dashboard
            </a>
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-semibold text-gray-900">Pipeline Execution Details</h1>
              <span
                class="inline-flex rounded-full px-3 py-1 text-sm font-semibold {{
                  getStatusColor(execution()!.status)
                }}"
              >
                {{ execution()!.status }}
              </span>
            </div>
          </div>

          <!-- Execution Info -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Execution Information</h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Execution ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono text-xs">
                    {{ execution()!.id }}
                  </dd>
                </div>
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Started At</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDate(execution()!.startedAt) }}
                  </dd>
                </div>
                @if (execution()!.completedAt) {
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Completed At</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ formatDate(execution()!.completedAt!) }}
                    </dd>
                  </div>
                }
                @if (execution()!.durationSeconds !== null) {
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ formatDuration(execution()!.durationSeconds!) }}
                    </dd>
                  </div>
                }
                @if (execution()!.errorMessage) {
                  <div class="bg-red-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-red-500">Error</dt>
                    <dd class="mt-1 text-sm text-red-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.errorMessage }}
                    </dd>
                  </div>
                }
              </dl>
            </div>
          </div>

          <!-- Topic -->
          @if (execution()!.topic) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Topic Generated</h3>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Title</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.topic!.title }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Description</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.topic!.description }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Image Keywords</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.topic!.imageKeywords }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Video Keywords</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.topic!.videoKeywords }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          }

          <!-- Scripts -->
          @if (execution()!.scripts?.length) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Scripts ({{ execution()!.scripts?.length }})
                </h3>
              </div>
              <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                  @for (script of execution()!.scripts; track script.id) {
                    <li class="px-4 py-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ script.title }}</p>
                          <div class="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span
                              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {{
                                script.language === 'es'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }}"
                            >
                              {{ script.language === 'es' ? 'Español' : 'English' }}
                            </span>
                            <span>{{ script.wordCount }} words</span>
                            <span>~{{ script.estimatedDuration }}s</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }

          <!-- Videos -->
          @if (execution()!.videos?.length) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Videos Generated ({{ execution()!.videos?.length }})
                </h3>
              </div>
              <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                  @for (video of execution()!.videos; track video.id) {
                    <li class="px-4 py-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="flex items-center space-x-3">
                            <span
                              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {{
                                video.language === 'es'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }}"
                            >
                              {{ video.language === 'es' ? 'Español' : 'English' }}
                            </span>
                            <span class="text-sm text-gray-900">{{ video.durationSeconds }}s</span>
                            <span class="text-sm text-gray-500">{{ video.fileSizeMb }}MB</span>
                          </div>
                        </div>
                        <a
                          routerLink="/videos"
                          class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Details →
                        </a>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }

          <!-- Uploads -->
          @if (execution()!.uploads?.length) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  YouTube Uploads ({{ execution()!.uploads?.length }})
                </h3>
              </div>
              <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                  @for (upload of execution()!.uploads; track upload.id) {
                    <li class="px-4 py-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ upload.title }}</p>
                          <div class="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>Channel: {{ upload.channel }}</span>
                            <span
                              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800"
                            >
                              {{ upload.privacyStatus }}
                            </span>
                          </div>
                        </div>
                        <a
                          [href]="upload.youtubeUrl"
                          target="_blank"
                          class="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          View on YouTube →
                        </a>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }

          <!-- Resource Usage -->
          @if (execution()!.resourceUsage) {
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Resource Usage</h3>
              </div>
              <div class="border-t border-gray-200">
                <dl>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">OpenAI Tokens</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ formatNumber(execution()!.resourceUsage!.openaiTokensTotal) }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">OpenAI Cost</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ formatCurrency(execution()!.resourceUsage!.openaiCostUsd) }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Total Processing Time</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.resourceUsage!.processingTimeSeconds }}s
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Edge TTS Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.resourceUsage!.edgeTtsDurationSeconds }}s
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">FFmpeg Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ execution()!.resourceUsage!.ffmpegDurationSeconds }}s
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
export class PipelineDetailComponent implements OnInit {
  private readonly pipelineService = inject(PipelineService);
  private readonly route = inject(ActivatedRoute);

  execution = signal<PipelineExecutionDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExecution(id);
    }
  }

  private loadExecution(id: string): void {
    this.pipelineService.getExecutionById(id).subscribe({
      next: (execution) => {
        this.execution.set(execution);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading execution:', err);
        this.error.set('Failed to load execution details');
        this.isLoading.set(false);
      },
    });
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

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  getStatusColor(status: string): string {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'running') return 'bg-blue-100 text-blue-800';
    if (status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }
}
