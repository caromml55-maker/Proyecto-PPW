import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../../models/models';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  isLoading = false;

  constructor(private router: Router, private apiUser: UserService) {}

  async login() {
    this.isLoading = true;
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      console.log('[Login] Iniciando sesión con Google...');
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      
      console.log('[Login] Usuario Google autenticado:', gUser.uid);
      
      // 1. Buscamos el usuario en la base de datos de Eclipse
      let dbUser = await this.apiUser.getUsuario(gUser.uid);

      if (!dbUser) {
        console.log('[Login] Usuario no existe en base de datos, creando...');
      
        const nuevoUsuario: User = {
          uid: gUser.uid,
          displayName: gUser.displayName || 'Usuario',
          email: gUser.email || '',
          photoURL: gUser.photoURL || '',
          role: 'user', 
          createdAt: new Date().toISOString().split('T')[0]
        };

        dbUser = await this.apiUser.crearUsuario(nuevoUsuario);
        console.log('[Login] Usuario creado exitosamente');
      } else {
        console.log('[Login] Usuario encontrado en base de datos, actualizando datos...');
       
        await this.apiUser.actualizarUsuario(gUser.uid, {
            displayName: gUser.displayName || dbUser.displayName,
            photoURL: gUser.photoURL || dbUser.photoURL
        });
        console.log('[Login] Usuario actualizado');
      }

      // 2. Redirigir según el rol
      const role = (dbUser.role || 'user').toLowerCase().trim();
      console.log('[Login] Rol del usuario:', role);
      
      if (role === 'admin') {
        console.log('[Login] Redirigiendo a /admin');
        await this.router.navigate(['/admin']);
      } else if (role === 'programador') {
        console.log('[Login] Redirigiendo a /programador');
        await this.router.navigate(['/programador']);
      } else {
        console.log('[Login] Redirigiendo a /usuario');
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
      
      // Manejo de errores específicos de popup
      const errCode = error?.code;
      if (
        errCode === 'auth/cancelled-popup-request' ||
        errCode === 'auth/popup-blocked' ||
        errCode === 'auth/popup-closed-by-user'
      ) {
        console.log('[Login] Popup cerrado/bloqueado, intentando redirect...');
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('[Login] Error en redirect:', redirectError);
          alert('Error: No se pudo completar la autenticación. Por favor, intenta de nuevo.');
        }
      } else if (error?.code === 'auth/network-request-failed') {
        alert('Error de conexión. Verifica tu conexión a internet.');
      } else if (error?.status === 0 || error?.message?.includes('Unknown Error')) {
        alert('❌ No se puede conectar al backend.\n\nVerifica que:\n1. El backend esté corriendo en puerto 8080\n2. CORS esté configurado\n3. Abre la consola (F12) para más detalles');
      } else {
        alert('Error: ' + (error?.message || 'Desconocido'));
      }
  }
}
