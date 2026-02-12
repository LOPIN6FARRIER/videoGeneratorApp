import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'channels',
        loadComponent: () =>
          import('./features/channels/channels-list/channels-list.component').then(
            (m) => m.ChannelsListComponent,
          ),
      },
      {
        path: 'channels/new',
        loadComponent: () =>
          import('./features/channels/channel-form/channel-form.component').then(
            (m) => m.ChannelFormComponent,
          ),
      },
      {
        path: 'channels/:id/edit',
        loadComponent: () =>
          import('./features/channels/channel-form/channel-form.component').then(
            (m) => m.ChannelFormComponent,
          ),
      },
      {
        path: 'channels/:id',
        loadComponent: () =>
          import('./features/channels/channel-form/channel-form.component').then(
            (m) => m.ChannelFormComponent,
          ),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/groups-list/groups-list.component').then(
            (m) => m.GroupsListComponent,
          ),
      },
      {
        path: 'groups/new',
        loadComponent: () =>
          import('./features/groups/group-form/group-form.component').then(
            (m) => m.GroupFormComponent,
          ),
      },
      {
        path: 'groups/:id/edit',
        loadComponent: () =>
          import('./features/groups/group-form/group-form.component').then(
            (m) => m.GroupFormComponent,
          ),
      },
      {
        path: 'prompts',
        loadComponent: () =>
          import('./features/prompts/prompts-list/prompts-list.component').then(
            (m) => m.PromptsListComponent,
          ),
      },
      {
        path: 'prompts/new',
        loadComponent: () =>
          import('./features/prompts/prompt-form/prompt-form.component').then(
            (m) => m.PromptFormComponent,
          ),
      },
      {
        path: 'prompts/:id/edit',
        loadComponent: () =>
          import('./features/prompts/prompt-form/prompt-form.component').then(
            (m) => m.PromptFormComponent,
          ),
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./features/config/config.component').then((m) => m.ConfigComponent),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./features/videos/videos.component').then((m) => m.VideosComponent),
      },
      {
        path: 'videos/:id',
        loadComponent: () =>
          import('./features/videos/video-detail.component').then((m) => m.VideoDetailComponent),
      },
      {
        path: 'pipeline/:id',
        loadComponent: () =>
          import('./features/pipeline/pipeline-detail.component').then(
            (m) => m.PipelineDetailComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
      },
      {
        path: 'topics',
        loadComponent: () =>
          import('./features/topics/topics-list.component').then((m) => m.TopicsListComponent),
      },
      {
        path: 'scripts',
        loadComponent: () =>
          import('./features/scripts/scripts-list.component').then((m) => m.ScriptsListComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
