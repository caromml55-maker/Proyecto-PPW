import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getHorarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/horario`);
  }

  getHorario(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/horario/${id}`);
  }

  crearHorario(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/horario`, data);
  }

  actualizarHorario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/horario/${id}`, data);
  }
}