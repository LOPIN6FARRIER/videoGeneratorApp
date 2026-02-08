import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChannelsService, Channel } from '../channels.service';

@Component({
  selector: 'app-channels-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './channels-list.component.html',
})
export class ChannelsListComponent implements OnInit {
  private channelsService = inject(ChannelsService);

  channels = computed(() => this.channelsService.channels());
  loading = computed(() => this.channelsService.loading());
  error = computed(() => this.channelsService.error());

  ngOnInit(): void {
    this.channelsService.getChannels();
  }

  deleteChannel(channel: Channel): void {
    if (confirm(`Are you sure you want to delete channel "${channel.name}"?`)) {
      this.channelsService.deleteChannel(channel.id).subscribe({
        next: () => {
          this.channelsService.getChannels();
        },
        error: (err) => {
          alert(`Error deleting channel: ${err.message}`);
        },
      });
    }
  }
}
