import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AsesoriaService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getAsesorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asesoria`);
  }

  getAsesoria(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/asesoria/${id}`);
  }

  crearAsesoria(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asesoria`, data);
  }

  actualizarAsesoria(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/asesoria/${id}`, data);
  }
}