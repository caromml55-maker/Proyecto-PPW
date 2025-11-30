import { Injectable, inject } from '@angular/core';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

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
}
