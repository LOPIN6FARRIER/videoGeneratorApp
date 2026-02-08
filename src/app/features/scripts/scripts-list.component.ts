import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScriptService, ScriptRecord } from '../../core/services/script.service';

@Component({
  selector: 'app-scripts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scripts-list.component.html',
})
export class ScriptsListComponent implements OnInit {
  private scriptService = inject(ScriptService);

  Math = Math;
  scripts = signal<ScriptRecord[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  total = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = 20;

  // Filters
  selectedLanguage = signal<string>('');

  ngOnInit(): void {
    this.loadScripts();
  }

  loadScripts(): void {
    this.loading.set(true);
    this.error.set(null);
    const offset = (this.currentPage() - 1) * this.pageSize;

    const language = this.selectedLanguage() || undefined;

    this.scriptService.getScripts(this.pageSize, offset, language).subscribe({
      next: (response) => {
        console.log('Scripts response:', response);
        this.scripts.set(response.scripts);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load scripts');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadScripts();
  }

  clearFilters(): void {
    this.selectedLanguage.set('');
    this.currentPage.set(1);
    this.loadScripts();
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize < this.total()) {
      this.currentPage.update((page) => page + 1);
      this.loadScripts();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadScripts();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  truncate(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getModelBadgeClass(model: string): string {
    if (model.includes('ollama') || model.includes('llama')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-blue-100 text-blue-800';
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  expandedScriptId = signal<string | null>(null);

  toggleExpand(scriptId: string): void {
    if (this.expandedScriptId() === scriptId) {
      this.expandedScriptId.set(null);
    } else {
      this.expandedScriptId.set(scriptId);
    }
  }

  isExpanded(scriptId: string): boolean {
    return this.expandedScriptId() === scriptId;
  }
}
