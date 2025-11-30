import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-asesoria',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './asesoria.html',
  styleUrl: './asesoria.scss',
})
export class Asesoria implements OnInit {

  pendientes: any[] = [];
  uidProgramador = "";

  constructor(){}

  async ngOnInit() {
    const auth = getAuth();
    this.uidProgramador = auth.currentUser?.uid || "";

    // cargar asesorías pendientes
    const db = getFirestore();
    const snap = await getDocs(collection(db, "asesorias"));

    this.pendientes = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((a: any) => a.uidProgramador === this.uidProgramador && a.estado === "pendiente");
  }

  async responder(a: any, nuevaRespuesta: string) {
    const db = getFirestore();
    const ref = doc(db, "asesorias", a.id);

    await updateDoc(ref, {
      estado: nuevaRespuesta,
      respuesta: nuevaRespuesta === "aceptada"
          ? "El programador ha aceptado tu asesoría"
          : "El programador ha rechazado tu asesoría "
    });

    alert("Respuesta enviada");

    this.ngOnInit();
  }

}
