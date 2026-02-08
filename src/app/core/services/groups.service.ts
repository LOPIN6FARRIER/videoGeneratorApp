import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Observable } from 'rxjs';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupWithChannels extends Group {
  channels_count: number;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private api = inject(ApiService);

  groups = signal<GroupWithChannels[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  getGroups(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.get<GroupWithChannels[]>('/groups').subscribe({
      next: (response) => {
        this.groups.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getGroup(id: string): Observable<any> {
    return this.api.get<Group>(`/groups/${id}`);
  }

  createGroup(data: CreateGroupDto): Observable<any> {
    return this.api.post<Group>('/groups', data);
  }

  updateGroup(id: string, data: UpdateGroupDto): Observable<any> {
    return this.api.put<Group>(`/groups/${id}`, data);
  }

  deleteGroup(id: string): Observable<any> {
    return this.api.delete(`/groups/${id}`);
  }
}
