import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lab.html',
  styleUrl: './lab.scss',
})
export class Lab implements OnInit{

  proyectosAcademicos: any[] = [];
  proyectosLaborales: any[] = [];

  mostrarFormulario = false;
  uidUsuario = "";

  nuevoProyecto = {
    tipo: 'academico',
    nombre: '',
    descripcion: '',
    tipoParticipacion: '',
    tecnologias: '',
    urlRepositorio: ''
  };
  creando = false;

  constructor() {}

  async ngOnInit() {
  const auth = getAuth();

  const checkUserLoaded = setInterval(async () => {
    const user = auth.currentUser;

    if (user) {
        clearInterval(checkUserLoaded);
        this.uidUsuario = user.uid;
        await this.cargarPortafolio();
      }
    }, 300);
  }

async cargarPortafolio() {
  const db = getFirestore();
  const ref = collection(db, 'portafolios');
  const q = query(ref, where('uidProgramador', '==', this.uidUsuario));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const info = snap.docs[0].data() as any;

    this.proyectosAcademicos = (info.proyectosAcademicos || []).map((p: any) => ({
      ...p,
      expandido: false
    }));

    this.proyectosLaborales = (info.proyectosLaborales || []).map((p: any) => ({
      ...p,
      expandido: false
    }));

  } else {
    this.proyectosAcademicos = [];
    this.proyectosLaborales = [];
  }
}


  
  async guardarProyecto() {
    const db = getFirestore();
    const ref = collection(db, 'portafolios');

    const q = query(ref, where('uidProgramador', '==', this.uidUsuario));
    const snap = await getDocs(q);

    const proyecto = { ...this.nuevoProyecto };

    if (snap.empty) {
      await addDoc(ref, {
        uidProgramador: this.uidUsuario,
        proyectosAcademicos: proyecto.tipo === 'academico' ? [proyecto] : [],
        proyectosLaborales: proyecto.tipo === 'laboral' ? [proyecto] : []
      });
    } else {
      const docRef = snap.docs[0].ref;
      const data: any = snap.docs[0].data();

      const academicos = data.proyectosAcademicos || [];
      const laborales = data.proyectosLaborales || [];

      if (proyecto.tipo === 'academico')
        academicos.push(proyecto);
      else
        laborales.push(proyecto);

      await updateDoc(docRef, {
        proyectosAcademicos: academicos,
        proyectosLaborales: laborales,
      });
    }


    this.mostrarFormulario = false;

    this.nuevoProyecto = {
      tipo: 'academico',
      nombre: '',
      descripcion: '',
      tipoParticipacion: '',
      tecnologias: '',
      urlRepositorio: ''
    };

    await this.cargarPortafolio();
  }


}
