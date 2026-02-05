import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private apiUrl = 'http://localhost:8085/api/reportes'; 
  private apiUrlLegacy = 'http://localhost:8080/gproyectoFinal/api';

  constructor(private http: HttpClient) {}

  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlLegacy}/users/programadores`);
  }

  getReporteAsesorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asesorias`);
  }
  
  getReporteProyectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proyectos`);
  }

  getDetalleAsesorias(uid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detalle-asesorias/${uid}`);
  }

  getDetalleProyectos(uid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detalle-proyectos/${uid}`);
  }
  
}
