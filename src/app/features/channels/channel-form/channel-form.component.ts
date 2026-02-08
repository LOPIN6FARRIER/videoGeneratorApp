import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelsService, type Channel, type CreateChannelDto } from '../channels.service';
import { PromptsService, type Prompt } from '../../../core/services/prompts.service';
import { YoutubeAuthService } from '../../../core/services/youtube-auth.service';
import { GroupsService, type GroupWithChannels } from '../../../core/services/groups.service';

@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './channel-form.component.html',
})
export class ChannelFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private channelsService = inject(ChannelsService);
  private promptsService = inject(PromptsService);
  private youtubeAuthService = inject(YoutubeAuthService);
  private groupsService = inject(GroupsService);

  channelId = signal<string | null>(null);
  isEditMode = computed(() => this.route.snapshot.url.some((segment) => segment.path === 'edit'));
  isViewMode = computed(
    () => !this.isEditMode() && this.channelId() !== null && this.channelId() !== 'new',
  );
  loading = signal(false);
  error = signal<string | null>(null);
  prompts = signal<Prompt[]>([]);
  groups = signal<GroupWithChannels[]>([]);

  // YouTube auth status
  authStatus = signal<{ isAuthenticated: boolean; expiresAt?: number }>({
    isAuthenticated: false,
  });

  // Prompt modal state
  showPromptModal = signal(false);
  editingPrompt = signal<Prompt | null>(null);
  promptForm = signal({
    type: 'topic' as 'topic' | 'script' | 'title' | 'description',
    name: '',
    prompt_text: '',
    enabled: true,
  });

  // OAuth manual flow state
  showOAuthModal = signal(false);
  oauthUrl = signal('');
  oauthCode = signal('');

  // Form model
  channel = signal<Partial<Channel>>({
    language: 'es',
    name: '',
    voice: 'es-MX-DaliaNeural',
    voice_rate: '+8%',
    voice_pitch: '+2Hz',
    enabled: true,
    cron_schedule: '0 0,8,16 * * *',
    subtitle_color: '#00D7FF',
    subtitle_outline_color: '#000000',
    font_size: 22,
    max_chars_per_line: 16,
    video_width: 1080,
    video_height: 1920,
    video_fps: 30,
    video_max_duration: 60,
    use_pexels_videos: false,
    upload_as_short: true,
  });

  ngOnInit(): void {
    // Cargar grupos disponibles
    this.groupsService.getGroups();
    this.groups = this.groupsService.groups;

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.channelId.set(id);
      this.loadChannel(id);
      this.loadPrompts(id);
      this.checkAuthStatus(id);
    }
  }

  loadChannel(id: string): void {
    this.loading.set(true);
    this.channelsService.getChannel(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.channel.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error loading channel');
        this.loading.set(false);
      },
    });
  }

  loadPrompts(channelId: string): void {
    this.promptsService.getPrompts(channelId).subscribe({
      next: (data) => {
        this.prompts.set(data.prompts);
      },
      error: (err) => {
        console.error('Error loading prompts:', err);
      },
    });
  }

  onSubmit(): void {
    const channelData = this.channel();
    this.loading.set(true);
    this.error.set(null);

    // Convert snake_case to camelCase for API
    const apiData: Partial<CreateChannelDto> = {
      language: channelData.language as 'es' | 'en',
      name: channelData.name,
      voice: channelData.voice,
      voiceRate: channelData.voice_rate,
      voicePitch: channelData.voice_pitch,
      groupId: channelData.group_id,
      enabled: channelData.enabled,
      cronSchedule: channelData.cron_schedule,
      subtitleColor: channelData.subtitle_color,
      subtitleOutlineColor: channelData.subtitle_outline_color,
      fontSize: channelData.font_size,
      maxCharsPerLine: channelData.max_chars_per_line,
      videoWidth: channelData.video_width,
      videoHeight: channelData.video_height,
      videoFps: channelData.video_fps,
      videoMaxDuration: channelData.video_max_duration,
      usePexelsVideos: channelData.use_pexels_videos,
      uploadAsShort: channelData.upload_as_short,
    };

    if (this.channelId() && this.channelId() !== 'new') {
      // Update
      this.channelsService.updateChannel(this.channelId()!, apiData).subscribe({
        next: () => {
          this.router.navigate(['/channels']);
        },
        error: (err) => {
          this.error.set(err.message || 'Error updating channel');
          this.loading.set(false);
        },
      });
    } else {
      // Create
      this.channelsService.createChannel(apiData as CreateChannelDto).subscribe({
        next: () => {
          this.router.navigate(['/channels']);
        },
        error: (err) => {
          this.error.set(err.message || 'Error creating channel');
          this.loading.set(false);
        },
      });
    }
  }

  deletePrompt(prompt: Prompt): void {
    if (confirm(`¿Eliminar prompt "${prompt.name}"?`)) {
      this.promptsService.deletePrompt(prompt.id).subscribe({
        next: () => {
          this.loadPrompts(this.channelId()!);
        },
        error: (err) => {
          alert(`Error: ${err.message}`);
        },
      });
    }
  }

  getPromptTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      topic: 'Topic',
      script: 'Script',
      title: 'Title',
      description: 'Description',
    };
    return labels[type] || type;
  }

  openCreatePromptModal(): void {
    this.editingPrompt.set(null);
    this.promptForm.set({
      type: 'topic',
      name: '',
      prompt_text: '',
      enabled: true,
    });
    this.showPromptModal.set(true);
  }

  openEditPromptModal(prompt: Prompt): void {
    this.editingPrompt.set(prompt);
    this.promptForm.set({
      type: prompt.type,
      name: prompt.name,
      prompt_text: prompt.prompt_text,
      enabled: prompt.enabled,
    });
    this.showPromptModal.set(true);
  }

  closePromptModal(): void {
    this.showPromptModal.set(false);
    this.editingPrompt.set(null);
  }

  savePrompt(): void {
    const form = this.promptForm();

    if (!form.name || !form.prompt_text) {
      alert('Name and prompt text are required');
      return;
    }

    const editingPromptId = this.editingPrompt()?.id;

    if (editingPromptId) {
      // Update existing prompt
      this.promptsService.updatePrompt(editingPromptId, form).subscribe({
        next: () => {
          this.loadPrompts(this.channelId()!);
          this.closePromptModal();
        },
        error: (err) => {
          alert(`Error updating prompt: ${err.message}`);
        },
      });
    } else {
      // Create new prompt
      this.promptsService
        .createPrompt({
          channel_id: this.channelId()!,
          ...form,
        })
        .subscribe({
          next: () => {
            this.loadPrompts(this.channelId()!);
            this.closePromptModal();
          },
          error: (err) => {
            alert(`Error creating prompt: ${err.message}`);
          },
        });
    }
  }

  checkAuthStatus(channelId: string): void {
    this.youtubeAuthService.checkAuthStatus(channelId).subscribe({
      next: (status) => {
        this.authStatus.set(status);
      },
      error: (err) => {
        console.error('Error checking auth status:', err);
      },
    });
  }

  connectYouTube(): void {
    const channelId = this.channelId();
    if (!channelId || channelId === 'new') {
      alert('Please save the channel first before connecting YouTube');
      return;
    }

    this.youtubeAuthService.getAuthUrl(channelId).subscribe({
      next: (response) => {
        // Mostrar modal con la URL y campo para el código
        this.oauthUrl.set(response.authUrl);
        this.oauthCode.set('');
        this.showOAuthModal.set(true);
      },
      error: (err) => {
        alert(`Error generating auth URL: ${err.error?.message || err.message}`);
      },
    });
  }

  openOAuthUrl(): void {
    window.open(this.oauthUrl(), '_blank');
  }

  submitOAuthCode(): void {
    const code = this.oauthCode().trim();
    if (!code) {
      alert('Please enter the authorization code');
      return;
    }

    const channelId = this.channelId()!;
    this.loading.set(true);

    this.youtubeAuthService.submitManualCode(channelId, code).subscribe({
      next: () => {
        this.showOAuthModal.set(false);
        this.checkAuthStatus(channelId);
        this.loading.set(false);
        alert('YouTube connected successfully!');
      },
      error: (err) => {
        this.loading.set(false);
        alert(`Error: ${err.error?.message || err.message}`);
      },
    });
  }

  closeOAuthModal(): void {
    this.showOAuthModal.set(false);
    this.oauthUrl.set('');
    this.oauthCode.set('');
  }

  disconnectYouTube(): void {
    if (!confirm('Are you sure you want to disconnect this channel from YouTube?')) {
      return;
    }

    const channelId = this.channelId();
    if (!channelId) return;

    this.youtubeAuthService.revokeAuth(channelId).subscribe({
      next: () => {
        this.authStatus.set({ isAuthenticated: false });
        alert('YouTube connection revoked successfully');
      },
      error: (err) => {
        alert(`Error revoking authentication: ${err.message}`);
      },
    });
  }
}
