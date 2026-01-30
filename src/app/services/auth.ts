import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { User } from '../models/models';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
}

interface FirebaseValidationResponse {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/gproyectoFinal/api';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar si hay usuario autenticado al iniciar
    this.checkAuthState();
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  private checkAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener token y validar con backend
          const idToken = await firebaseUser.getIdToken();
          const validatedUser = await this.validateTokenWithBackend(idToken);
          this.currentUserSubject.next(validatedUser);
        } catch (error) {
          console.error('Error validating token:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loginWithGoogle(): Promise<AuthUser> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      console.log('[AuthService] Iniciando login con Google...');
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log('[AuthService] Usuario Firebase autenticado:', firebaseUser.uid);

      // Obtener token de Firebase
      const idToken = await firebaseUser.getIdToken();
      console.log('[AuthService] Token obtenido, validando con backend...');

      // Validar token con backend Jakarta
      const validatedUser = await this.validateTokenWithBackend(idToken);

      console.log('[AuthService] ✅ Usuario validado por backend:', validatedUser);
      this.currentUserSubject.next(validatedUser);

      return validatedUser;

    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/cancelled-popup-request' ||
          code === 'auth/popup-blocked' ||
          code === 'auth/popup-closed-by-user') {
        console.log('[AuthService] Popup bloqueado, intentando redirect...');
        try {
          await signInWithRedirect(auth, provider);
          return {} as AuthUser; // Será manejado por checkAuthState
        } catch (e) {
          console.error('[AuthService] Redirect failed:', e);
          throw e;
        }
      }
      throw err;
    }
  }

  private async validateTokenWithBackend(idToken: string): Promise<AuthUser> {
    try {
      const response = await firstValueFrom(
        this.http.post<FirebaseValidationResponse>(`${this.API_URL}/auth/validate-token`, { token: idToken })
          .pipe(timeout(10000))
      );

      // El backend devuelve { uid, email, name, photoURL, role }
      return {
        uid: response.uid,
        email: response.email,
        displayName: response.name,
        photoURL: response.photoURL,
        role: response.role,
        createdAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('[AuthService] ❌ Error validando token con backend:', error);
      throw new Error('Token inválido o backend no disponible');
    }
  }

  async logout(): Promise<void> {
    const auth = getAuth();
    await signOut(auth);
    this.currentUserSubject.next(null);
    console.log('[AuthService] Usuario desconectado');
  }

  // Método para obtener token actual (útil para interceptores)
  async getCurrentToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}
