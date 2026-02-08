import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicService, TopicRecord } from '../../core/services/topic.service';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topics-list.component.html',
})
export class TopicsListComponent implements OnInit {
  private topicService = inject(TopicService);

  Math = Math;
  topics = signal<TopicRecord[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  total = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = 20;

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.loading.set(true);
    this.error.set(null);
    const offset = (this.currentPage() - 1) * this.pageSize;

    this.topicService.getTopics(this.pageSize, offset).subscribe({
      next: (response) => {
        this.topics.set(response.topics);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load topics');
        this.loading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize < this.total()) {
      this.currentPage.update((page) => page + 1);
      this.loadTopics();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadTopics();
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
}
