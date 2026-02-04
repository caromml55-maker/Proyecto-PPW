import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Data {
  private api = 'http://localhost:8080/gproyectoFinal/api'; // Ajusta según tu server

  constructor(private http: HttpClient) {}

  // Usuarios (Programadores)
  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/user/role/programador`);
  }

  // Horarios con estado (El que creamos en tu backend)
  getHorariosVistosPorUsuario(uidProg: string, uidUser: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/horario/programador/${uidProg}/visto-por/${uidUser}`);
  }

  // Asesorías
  solicitarAsesoria(datos: any): Observable<any> {
    return this.http.post(`${this.api}/asesoria`, datos);
  }

  cancelarAsesoria(id: number): Observable<any> {
    return this.http.delete(`${this.api}/asesoria/${id}`);
  }
}
