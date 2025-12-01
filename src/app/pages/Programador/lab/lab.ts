import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { RouterModule } from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';

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

  uidUsuario = "";
  loading = false;

  nuevoProyecto = {
    tipo: 'academico',
    nombre: '',
    descripcion: '',
    tipoParticipacion: '',
    tecnologias: '',
    urlRepositorio: '',
    enlaceDemo: ''
  };
  creando = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      this.uidUsuario = user.uid;
      await this.cargarPortafolio();
    }
  }

async cargarPortafolio() {
  this.loading = true;
  const db = getFirestore();
  const ref = collection(db, 'portafolios');
  const q = query(ref, where('uidProgramador', '==', this.uidUsuario));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const info = snap.docs[0].data() as any;

    this.proyectosAcademicos = (info.proyectosAcademicos || [])
    .filter((p: any) => p && p.nombre && p.nombre.trim() !== "") 
    .map((p: any) => ({
      ...p,
      enlaceDemo: p.enlaceDemo || "",
      expandido: false
    }));

    this.proyectosLaborales = (info.proyectosLaborales || [])
    .filter((p: any) => p && p.nombre && p.nombre.trim() !== "") 
    .map((p: any) => ({
      ...p,
      enlaceDemo: p.enlaceDemo || "",
      expandido: false
    }));

  } else {
    this.proyectosAcademicos = [];
    this.proyectosLaborales = [];
  }
  this.loading = false;
  this.cdRef.detectChanges();
}
  
  async guardarProyecto() {
    const db = getFirestore();
    const ref = collection(db, 'portafolios');

    const q = query(ref, where('uidProgramador', '==', this.uidUsuario));
    const snap = await getDocs(q);

    const proyecto = { ...this.nuevoProyecto,  expandido: false };

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


    this.creando = false;

    this.nuevoProyecto = {
      tipo: 'academico',
      nombre: '',
      descripcion: '',
      tipoParticipacion: '',
      tecnologias: '',
      urlRepositorio: '',
      enlaceDemo: ''
    };

    await this.cargarPortafolio();
  }

  cancelarCreacion() {
  this.creando = false;
  }

  async eliminarProyecto(proyecto: any, tipo: string) {

  if (!confirm("¿Seguro que deseas eliminar este proyecto?")) return;

  const db = getFirestore();
  const ref = collection(db, 'portafolios');
  const q = query(ref, where('uidProgramador', '==', this.uidUsuario));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    const data: any = snap.docs[0].data();

    if (tipo === 'academico') {
      const nuevos = data.proyectosAcademicos.filter((p: any) => p.nombre !== proyecto.nombre);
      await updateDoc(docRef, { proyectosAcademicos: nuevos });
    }

    if (tipo === 'laboral') {
      const nuevos = data.proyectosLaborales.filter((p: any) => p.nombre !== proyecto.nombre);
      await updateDoc(docRef, { proyectosLaborales: nuevos });
    }
  }

  await this.cargarPortafolio();
}

}
