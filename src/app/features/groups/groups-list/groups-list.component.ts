import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../../../core/services/groups.service';
import type { GroupWithChannels } from '../../../core/services/groups.service';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './groups-list.component.html',
})
export class GroupsListComponent implements OnInit {
  private groupsService = inject(GroupsService);

  groups = computed(() => this.groupsService.groups());
  loading = computed(() => this.groupsService.loading());
  error = computed(() => this.groupsService.error());

  ngOnInit(): void {
    this.groupsService.getGroups();
  }

  deleteGroup(group: GroupWithChannels): void {
    if (group.channels_count > 0) {
      alert(
        `Cannot delete group "${group.name}" because it has ${group.channels_count} assigned channel(s). Please reassign or delete the channels first.`,
      );
      return;
    }

    if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
      this.groupsService.deleteGroup(group.id).subscribe({
        next: () => {
          this.groupsService.getGroups();
        },
        error: (err) => {
          alert(`Error deleting group: ${err.message}`);
        },
      });
    }
  }
}
