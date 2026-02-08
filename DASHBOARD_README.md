# Video Generator Dashboard

Angular 21 dashboard con las últimas características y mejores prácticas.

## ✨ Características

- **Angular 21** con standalone components
- **Signals** para manejo de estado reactivo
- **Tailwind CSS** para estilos
- **Functional Guards** para protección de rutas
- **HTTP Interceptors** para autenticación y manejo de errores
- **Reactive Forms** con validación
- **Lazy Loading** de rutas
- **TypeScript** modo estricto

## 🏗️ Arquitectura

```
src/app/
├── core/                      # Servicios core y configuración
│   ├── guards/                # Guardias de ruta
│   │   └── auth.guard.ts      # Protección de rutas autenticadas
│   ├── interceptors/          # HTTP interceptors
│   │   ├── api.interceptor.ts # Agregar token JWT
│   │   └── error.interceptor.ts # Manejo global de errores
│   └── services/              # Servicios core
│       ├── api.service.ts     # Cliente HTTP base
│       └── auth.service.ts    # Autenticación con signals
├── shared/                    # Componentes compartidos
│   └── components/
│       └── layout/            # Layout principal
│           ├── layout.component.ts
│           └── layout.component.html
├── features/                  # Módulos de características
│   ├── auth/
│   │   └── login/             # Login con reactive forms
│   ├── dashboard/             # Dashboard home
│   ├── channels/              # Gestión de canales
│   │   ├── channels-list/     # Lista con tabla
│   │   ├── channel-form/      # Formulario CRUD
│   │   └── channels.service.ts # Servicio con signals
│   ├── prompts/               # Gestión de prompts
│   ├── config/                # Configuración
│   └── videos/                # Lista de videos
└── environments/              # Configuración de entorno
```

## 🚀 Comenzar

### Prerequisitos

- Node.js 20+
- npm 11+
- Angular CLI 21

### Instalación

```bash
cd videoGeneratorApp
npm install
```

### Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Build

```bash
npm run build
```

## 🔐 Autenticación

Login temporal (mock):
- Email: cualquier email
- Password: cualquier password (mínimo 6 caracteres)

## 🛣️ Rutas

### Públicas
- `/login` - Página de inicio de sesión

### Protegidas (requieren autenticación)
- `/dashboard` - Dashboard principal con estadísticas
- `/channels` - Lista de canales
- `/channels/new` - Crear canal
- `/channels/:id/edit` - Editar canal
- `/prompts` - Lista de prompts
- `/prompts/new` - Crear prompt
- `/prompts/:id/edit` - Editar prompt
- `/config` - Configuración
- `/videos` - Lista de videos

## 🔧 Configuración API

La API base está configurada en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

## 📡 API Endpoints

El dashboard se conecta a estos endpoints:

- `GET /api/channels` - Listar canales
- `POST /api/channels` - Crear canal
- `GET /api/channels/:id` - Obtener canal
- `PUT /api/channels/:id` - Actualizar canal
- `DELETE /api/channels/:id` - Eliminar canal
- `GET /api/prompts` - Listar prompts
- `GET /api/config` - Obtener configuración
- `GET /api/videos` - Listar videos

## 🎨 Signals y Estado

Ejemplo de uso de signals en servicios:

```typescript
export class ChannelsService {
  // Signals para estado reactivo
  channels = signal<Channel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed values
  activeChannels = computed(() => 
    this.channels().filter(c => c.enabled)
  );
}
```

## 🛡️ Guards y Interceptors

### Auth Guard (Functional)
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() || inject(Router).navigate(['/login']);
};
```

### API Interceptor
Agrega automáticamente el token JWT a todas las peticiones:
```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

## 📝 Componentes Completados

- ✅ Login con reactive forms
- ✅ Layout con navbar y navegación
- ✅ Dashboard con tarjetas de estadísticas
- ✅ Channels list con tabla
- ✅ Channels service con signals
- ⏳ Channels form (próximamente)
- ⏳ Prompts CRUD (próximamente)
- ⏳ Config editor (próximamente)
- ⏳ Videos list (próximamente)

## 🎯 Próximos Pasos

1. Completar formulario de canales con validación
2. Implementar CRUD de prompts
3. Crear página de configuración con key-value editor
4. Implementar lista de videos con filtros
5. Agregar notificaciones toast
6. Implementar paginación en tablas
7. Agregar búsqueda y filtros
8. Conectar con API real
9. Agregar tests unitarios
10. Implementar CI/CD

## 🤝 Contribuir

Este proyecto usa las mejores prácticas de Angular 21:
- Standalone components
- Signals para estado reactivo
- Functional guards y interceptors
- Lazy loading
- TypeScript strict mode
- Tailwind CSS para estilos

## 📄 Licencia

MIT
