import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getFirestore, collection, onSnapshot, deleteDoc, doc as firestoreDoc } from 'firebase/firestore';
import { AppUser } from '../../models/app-user.model';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements OnInit {

  section: string = 'programadores'; 
  programadores: Array<AppUser & { id: string }> = [];

  constructor() {}

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores() {
    const db = getFirestore();
    const ref = collection(db, 'users');

    onSnapshot(ref, (snapshot) => {
      this.programadores = snapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as AppUser) }))
        .filter((user) => user.role === 'programmer');
    });
  }

  async eliminarProgramador(id: string) {
    const confirmar = confirm("¿Estás seguro de eliminar este programador?");
    if (!confirmar) return;

    const db = getFirestore();
    await deleteDoc(firestoreDoc(db, 'users', id));
    alert("Programador eliminado.");
  }

  editarProgramador(p: any) {
    alert("Abrir modal de edición (lo hacemos después)");
  }

  crearProgramador() {
    alert("Abrir formulario de nuevo programador (lo hacemos después)");
  }
  logout() {
    // Implementar cierre de sesión aquí
    alert("Cerrar sesión (lo hacemos después)");
  }
}
