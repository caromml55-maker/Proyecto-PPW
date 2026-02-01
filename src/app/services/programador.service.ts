import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgramadorService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  // PROGRAMADORES
  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/programadores`);
  }

  getProgramador(uid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${uid}`);
  }

  // ADMINS
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/admins`);
  }

  // USUARIOS
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/usuarios`);
  }

  // CRUD
  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  actualizarUsuario(uid: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${uid}`, data);
  }

  eliminarUsuario(uid: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${uid}`);
  }
}
