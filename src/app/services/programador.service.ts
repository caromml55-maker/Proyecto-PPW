import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgramadorService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/programadores`);
  }

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admins`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUserByUid(uid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${uid}`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, data);
  }

  actualizarUsuario(uid: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${uid}`, data);
  }

  eliminarUsuario(uid: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${uid}`);
  }

  getProgramador(uid: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/programadores/${uid}`);
  }

  actualizarProgramador(uid: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${uid}`, data);
  }

  cambiarRolUsuario(uid: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${uid}/role`, { role });
  }
}
