import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Observable, throwError } from 'rxjs';

export interface Horario {
  id?: string;
  programadorId: string;
  fecha: string;
  inicio: string;
  fin: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private db = getFirestore();

   private apiUrl = 'http://localhost:8080/gproyectoFinal/api/horario';

   constructor(private http: HttpClient) {}
/*
  // Obtener todos los Horario de un programador
  async getHorarioByProgramador(programadorId: string): Promise<Horario[]> {
    try {
      const HorarioRef = collection(this.db, 'horarios');
      const q = query(HorarioRef, where('programadorId', '==', programadorId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Horario));
    } catch (error) {
      console.error('Error obteniendo Horario:', error);
      throw error;
    }
  }

  async guardarHorario(horario: Omit<Horario, 'id'>): Promise<string> {
    try {
      const HorarioRef = collection(this.db, 'horarios');
      const docRef = await addDoc(HorarioRef, horario);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando horario:', error);
      throw error;
    }
  }

  // Eliminar un horario
  async eliminarHorario(horarioId: string): Promise<void> {
    try {
      const horarioRef = doc(this.db, 'horarios', horarioId);
      await deleteDoc(horarioRef);
    } catch (error) {
      console.error('Error eliminando horario:', error);
      throw error;
    }
  }

  // Obtener todos los Horario (para admin)
  async getAllHorario(): Promise<Horario[]> {
    try {
      const HorarioRef = collection(this.db, 'horrios');
      const querySnapshot = await getDocs(HorarioRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Horario));
    } catch (error) {
      console.error('Error obteniendo todos los Horarios:', error);
      throw error;
    }
  }

  // ================= API BACKEND =================

  getAllHorarioAPI() {
    return this.http.get<Horario[]>(this.apiUrl);
  }

  getHorarioByIdAPI(id: string) {
    return this.http.get<Horario>(`${this.apiUrl}/${id}`);
  }

  guardarHorarioAPI(horario: Horario) {
    return this.http.post<Horario>(this.apiUrl, horario);
  }

  actualizarHorarioAPI(horario: Horario) {
    return this.http.put<Horario>(
      `${this.apiUrl}/${horario.id}`,
      horario
    );
  }

  eliminarHorarioAPI(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }*/

    
  // ===============================
  // PROGRAMADORES
  // ===============================
  getProgramadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user`);
  }

  // ===============================
  // OBTENER HORARIOS POR PROGRAMADOR
  // ===============================
  getHorarioByProgramadorAPI(id: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(
      `${this.apiUrl}/horario/programador/${id}`
    );
  }

  // ===============================
  // GUARDAR
  // ===============================
  guardarHorarioAPI(h: Horario): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/horario`,
      h
    );
  }

  // ===============================
  // ELIMINAR
  // ===============================
  eliminarHorarioAPI(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/horario/${id}`
    );
  }

  // ===============================
  // LISTAR TODOS (ADMIN)
  // ===============================
  getAllHorario(): Observable<Horario[]> {
    return this.http.get<Horario[]>(
      `${this.apiUrl}/horario`
    );
  }

}
