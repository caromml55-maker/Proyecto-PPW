import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortafolioService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getPortafolios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/portafolio`);
  }

  getPortafolio(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portafolio/${id}`);
  }

  crearPortafolio(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/portafolio`, data);
  }

  actualizarPortafolio(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/portafolio/${id}`, data);
  }
}