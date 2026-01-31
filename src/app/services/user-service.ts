import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom, timeout } from 'rxjs';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  private URL = 'http://localhost:8080/gproyectoFinal/api/users';

  constructor(private http: HttpClient) {
    console.log(`[UserService] Inicializado con URL: ${this.URL}`);
  }

  async getUsuario(uid: string): Promise<User | null> {
    try {
      const url = `${this.URL}/${uid}`;
      console.log(`[UserService] GET ${url}`);
      
      const usuario = await firstValueFrom(
        this.http.get<User>(url).pipe(timeout(10000))
      );
      console.log(`[UserService] ✅ Usuario encontrado:`, usuario);
      return usuario;
    } catch (error: any) {
      console.warn(`[UserService] ❌ Error en GET:`, {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });
      
      if (error.status === 404) {
        console.log(`[UserService] Usuario no existe (404)`);
        return null; 
      }
      throw error;
    }
  }

  async crearUsuario(user: User): Promise<User> {
    try {
      console.log(`[UserService] POST ${this.URL}`, user);
      const nuevoUsuario = await firstValueFrom(
        this.http.post<User>(this.URL, user).pipe(timeout(10000))
      );
      console.log(`[UserService] ✅ Usuario creado:`, nuevoUsuario);
      return nuevoUsuario;
    } catch (error: any) {
      console.error(`[UserService] ❌ Error en POST:`, {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });
      throw error;
    }
  }

  async actualizarUsuario(uid: string, user: Partial<User>): Promise<User> {
    try {
      const url = `${this.URL}/${uid}`;
      console.log(`[UserService] PUT ${url}`, user);
      const usuarioActualizado = await firstValueFrom(
        this.http.put<User>(url, user).pipe(timeout(10000))
      );
      console.log(`[UserService] ✅ Usuario actualizado:`, usuarioActualizado);
      return usuarioActualizado;
    } catch (error: any) {
      console.error(`[UserService] ❌ Error en PUT:`, {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });
      throw error;
    }
  }
}
