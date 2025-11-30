import { Injectable } from '@angular/core';
import { getFirestore, collection, getDocs, doc,getDoc,addDoc,setDoc,updateDoc,deleteDoc,serverTimestamp,query,where,CollectionReference } from 'firebase/firestore';
import { AppUser } from '../models/app-user.model';

@Injectable({ providedIn: 'root' })
export class ProgramadorService {
  private collectionName = 'users';

  constructor() {}

  private getCollection() {
    return collection(getFirestore(), this.collectionName);
  }

  async getProgramadores(): Promise<any[]> {
    try {
      const q = query(
        this.getCollection(),
        where('role', '==', 'programador')
      );
      const snap = await getDocs(q);

      return snap.docs.map(d => {
  const data: any = d.data();

  return {
    uid: d.id,
    displayName: data.displayName || data.name || '(sin nombre)',
    email: data.email || '',
    photoURL: data.photoURL || '',
    especialidad: data.especialidad || '',
    descripcion: data.descripcion || '',
    telefono: data.telefono || '',
    role: data.role || 'programador',
    redesSociales: data.redesSociales || {
      facebook: '',
      instagram: ''
    },
  };
});


    } catch (e) {
      console.error('Error obteniendo programadores:', e);
      return [];
    }
  }

  async getProgramador(uid: string): Promise<any | null> {
    try {
      const ref = doc(getFirestore(), this.collectionName, uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return null;

      return { uid: snap.id, ...snap.data() };

    } catch (e) {
      console.error('Error obteniendo programador:', e);
      return null;
    }
  }

  async crearProgramador(data: any): Promise<string | null> {
    try {
      const db = getFirestore();
      const ref = await addDoc(collection(db, this.collectionName), {
        ...data,
        role: 'programador',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return ref.id;

    } catch (e) {
      console.error('Error creando programador:', e);
      return null;
    }
  }

   async actualizarProgramador(uid: string, data: any): Promise<boolean> {
    try {
      const ref = doc(getFirestore(), this.collectionName, uid);
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;

    } catch (e) {
      console.error('Error actualizando programador:', e);
      return false;
    }
  }

  async eliminarProgramador(uid: string): Promise<boolean> {
    try {
      const ref = doc(getFirestore(), this.collectionName, uid);
      await deleteDoc(ref);
      return true;

    } catch (e) {
      console.error('Error eliminando programador:', e);
      return false;
    }
  }
  async updateHorarios(uid: string, horarios: any[]): Promise<boolean> {
    try {
      const ref = doc(getFirestore(), this.collectionName, uid);
      await updateDoc(ref, {
        horariosDisponibles: horarios,
        updatedAt: serverTimestamp()
      });

      return true;

    } catch (e) {
      console.error('Error guardando horarios:', e);
      return false;
    }
  }

}
