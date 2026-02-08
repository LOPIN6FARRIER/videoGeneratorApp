import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  statusCode?: number;
}

interface ConfigItem {
  key: string;
  value: string;
  description: string | null;
  updated_at: Date;
}

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center mb-6">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Application Configuration</h1>
          <p class="mt-2 text-sm text-gray-700">Manage global application settings</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            (click)="saveConfig()"
            [disabled]="isSaving()"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            @if (isSaving()) {
              <span>Saving...</span>
            } @else {
              <span>Save Configuration</span>
            }
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }

      @if (error()) {
        <div class="rounded-md bg-red-50 p-4 mb-4">
          <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
        </div>
      }

      @if (successMessage()) {
        <div class="rounded-md bg-green-50 p-4 mb-4">
          <h3 class="text-sm font-medium text-green-800">{{ successMessage() }}</h3>
        </div>
      }

      @if (!isLoading()) {
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="border-t border-gray-200">
            @for (item of config(); track item.key) {
              <div
                class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-200"
              >
                <div>
                  <dt class="text-sm font-medium text-gray-900">{{ item.key }}</dt>
                  @if (item.description) {
                    <dd class="mt-1 text-xs text-gray-500">{{ item.description }}</dd>
                  }
                </div>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  @if (isPasswordField(item.key)) {
                    <input
                      type="password"
                      [(ngModel)]="item.value"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter {{ item.key }}"
                    />
                  } @else {
                    <input
                      type="text"
                      [(ngModel)]="item.value"
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter {{ item.key }}"
                    />
                  }
                </dd>
              </div>
            }
          </div>
        </div>

        <!-- Add New Config -->
        <div class="mt-8 bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Add New Configuration</h3>
            <div class="mt-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Key</label>
                <input
                  type="text"
                  [(ngModel)]="newConfig.key"
                  class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="CONFIG_KEY"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="text"
                  [(ngModel)]="newConfig.value"
                  class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="value"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  [(ngModel)]="newConfig.description"
                  class="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Description (optional)"
                />
              </div>
              <button
                (click)="addConfig()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Configuration
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ConfigComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/config`;

  config = signal<ConfigItem[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  newConfig = {
    key: '',
    value: '',
    description: '',
  };

  ngOnInit(): void {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.http
      .get<ApiResponse<ConfigItem[]>>(this.apiUrl)
      .pipe(map((response) => response.data))
      .subscribe({
        next: (data) => {
          this.config.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading config:', err);
          this.error.set('Failed to load configuration');
          this.isLoading.set(false);
        },
      });
  }

  saveConfig(): void {
    this.isSaving.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const updates = this.config().map((item) => ({
      key: item.key,
      value: item.value,
      description: item.description,
    }));

    this.http.post(`${this.apiUrl}/bulk`, { configs: updates }).subscribe({
      next: () => {
        this.successMessage.set('Configuration saved successfully');
        this.isSaving.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Error saving config:', err);
        this.error.set('Failed to save configuration');
        this.isSaving.set(false);
      },
    });
  }

  addConfig(): void {
    if (!this.newConfig.key || !this.newConfig.value) {
      this.error.set('Key and value are required');
      return;
    }

    this.http
      .post<ApiResponse<ConfigItem>>(this.apiUrl, this.newConfig)
      .pipe(map((response) => response.data))
      .subscribe({
        next: () => {
          this.successMessage.set('Configuration added successfully');
          this.newConfig = { key: '', value: '', description: '' };
          this.loadConfig();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          console.error('Error adding config:', err);
          this.error.set('Failed to add configuration');
        },
      });
  }

  isPasswordField(key: string): boolean {
    return (
      key.toLowerCase().includes('key') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('token')
    );
  }
}
