import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Horario {
  id?: number; 
  programadorUid: string; 
  fecha: string;
  inicio: string;
  fin: string;
  modalidad: string; 
}

@Injectable({ 
  providedIn: 'root' 
})

export class HorarioService {
  private apiUrl = 'http://localhost:8080/gproyectoFinal/api/horario';
  private apiUsers = 'http://localhost:8080/gproyectoFinal/api/users'; 

  constructor(private http: HttpClient) {}

  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUsers}/list`); 
  }

  getHorarioByProgramadorAPI(uid: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/programador/${uid}`);
  }

  guardarHorarioAPI(horario: Horario): Observable<any> {
    return this.http.post(this.apiUrl, horario);
  }

  eliminarHorarioAPI(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}