import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsService, DashboardStats, RecentActivity } from '../../core/services/stats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);

  stats = signal<DashboardStats>({
    totalChannels: 0,
    totalVideos: 0,
    totalExecutions: 0,
    successRate: 0,
    totalTokens: 0,
    totalCostUSD: 0,
    avgProcessingTime: 0,
  });

  recentActivity = signal<RecentActivity[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivity();
  }

  private loadStats(): void {
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error.set('Failed to load statistics');
        this.isLoading.set(false);
      },
    });
  }

  private loadRecentActivity(): void {
    this.statsService.getRecentActivity(10).subscribe({
      next: (activity) => {
        this.recentActivity.set(activity);
      },
      error: (err) => {
        console.error('Error loading recent activity:', err);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'execution':
        return '⚙️';
      case 'upload':
        return '📤';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'execution':
        return 'bg-blue-100 text-blue-800';
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActivityLink(activity: RecentActivity): string {
    if (activity.type === 'execution') {
      return `/pipeline/${activity.id}`;
    }
    return '/dashboard';
  }
}
