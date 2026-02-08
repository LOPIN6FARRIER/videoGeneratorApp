import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VideoService, VideoRecord } from '../../core/services/video.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './videos.component.html',
})
export class VideosComponent implements OnInit {
  private readonly videoService = inject(VideoService);

  videos = signal<VideoRecord[]>([]);
  total = signal(0);
  isLoading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = 20;
  selectedLanguage = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.isLoading.set(true);
    const offset = (this.currentPage() - 1) * this.pageSize;

    this.videoService.getVideos(this.pageSize, offset, this.selectedLanguage()).subscribe({
      next: (result) => {
        this.videos.set(result.videos);
        this.total.set(result.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error.set('Failed to load videos');
        this.isLoading.set(false);
      },
    });
  }

  filterByLanguage(language: string | undefined): void {
    this.selectedLanguage.set(language);
    this.currentPage.set(1);
    this.loadVideos();
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize < this.total()) {
      this.currentPage.update((page) => page + 1);
      this.loadVideos();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadVideos();
    }
  }

  readonly Math = Math;

  get totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
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
      month: 'short',
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

  getStatusColor(status?: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status === 'public') return 'bg-green-100 text-green-800';
    if (status === 'private') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }

  deleteVideo(video: VideoRecord): void {
    const confirmMessage = video.upload
      ? `¿Borrar "${video.topic?.title}"?\n\nEste video ya está subido a YouTube. Solo se eliminará de la base de datos, no de YouTube.`
      : `¿Borrar "${video.topic?.title}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.videoService.deleteVideo(video.id, false).subscribe({
      next: () => {
        // Remover del array local
        this.videos.update((videos) => videos.filter((v) => v.id !== video.id));
        this.total.update((total) => total - 1);
      },
      error: (err) => {
        console.error('Error deleting video:', err);
        alert('Error al borrar el video. Intenta de nuevo.');
      },
    });
  }
}
