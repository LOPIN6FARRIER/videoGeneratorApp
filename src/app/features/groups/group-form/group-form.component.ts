import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupsService } from '../../../core/services/groups.service';
import type { Group } from '../../../core/services/groups.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './group-form.component.html',
})
export class GroupFormComponent implements OnInit {
  private groupsService = inject(GroupsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  group = signal<Partial<Group>>({
    name: '',
    description: '',
    enabled: true,
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadGroup(id);
    }
  }

  loadGroup(id: string): void {
    this.loading.set(true);
    this.groupsService.getGroup(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.group.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load group');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    const groupData = this.group();

    if (!groupData.name?.trim()) {
      this.error.set('Group name is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const operation = this.isEditMode()
      ? this.groupsService.updateGroup(groupData.id!, {
          name: groupData.name,
          description: groupData.description || undefined,
          enabled: groupData.enabled,
        })
      : this.groupsService.createGroup({
          name: groupData.name,
          description: groupData.description || undefined,
          enabled: groupData.enabled !== false,
        });

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/groups']);
        } else {
          this.error.set(response.message || 'Operation failed');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Operation failed');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/groups']);
  }
}
