import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async login() {
    this.isLoading = true;

    try {
      console.log('[Login] Iniciando login con AuthService...');

      // 1. Login con Google + validación de token en backend
      const authUser: AuthUser = await this.authService.loginWithGoogle();
      console.log('[Login] ✅ Usuario autenticado y validado:', authUser);

      // 2. El AuthService ya validó el token y consultó la BD, ahora solo redirigir
      console.log('[Login] ✅ Usuario validado completamente:', authUser);

      // 3. Redirigir según rol (ya viene del backend)
      const role = (authUser.role || 'user').toLowerCase().trim();
      console.log('[Login] Redirigiendo según rol:', role);

      if (role === 'admin') {
        await this.router.navigate(['/admin']);
      } else if (role === 'programador') {
        await this.router.navigate(['/programador']);
      } else {
        await this.router.navigate(['/usuario']);
      }

    } catch (error: any) {
      this.isLoading = false;

      console.error('[Login] ❌ Error completo:', error);
      console.error('[Login] Error details:', {
        name: error?.name,
        code: error?.code,
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText
      });

      // Manejo de errores específicos
      if (error?.code === 'auth/network-request-failed') {
        alert('Error de conexión. Verifica tu conexión a internet.');
      } else if (error?.status === 0 || error?.message?.includes('Unknown Error')) {
        alert('❌ No se puede conectar al backend.\n\nVerifica que:\n1. El backend esté corriendo en puerto 8080\n2. CORS esté configurado\n3. Firebase esté inicializado\n4. Abre la consola (F12) para más detalles');
      } else if (error?.message?.includes('Token inválido')) {
        alert('Error de autenticación. El token de Firebase es inválido.');
      } else {
        alert('Error: ' + (error?.message || 'Desconocido'));
      }
    }
  }
}
