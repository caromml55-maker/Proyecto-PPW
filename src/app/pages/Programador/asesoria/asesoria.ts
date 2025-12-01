import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-asesoria',
  imports: [CommonModule, RouterLink, RouterOutlet],
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

  const db = getFirestore();

  // 👉 1. obtenemos asesorías
  const snapA = await getDocs(collection(db, "asesorias"));

  let asesorias = snapA.docs
    .map((d: any) => ({ id: d.id, ...d.data() as any }))
    .filter((a: any) =>
      a.programadorId === this.uidProgramador &&
      a.estado === "pendiente"
    );

  // 👉 2. obtenemos usuarios
  const snapUsers = await getDocs(collection(db, "users"));
  const users = snapUsers.docs.map((d: any) => ({
    id: d.id,
    ...d.data() as any
  }));

  // 👉 3. combinamos usuario + asesoría
  this.pendientes = asesorias.map((a: any) => {
    const u = users.find((x: any) => x.uid === a.usuarioId);

    return {
      ...a,
      usuarioNombre: u?.displayName || u?.name || u?.nombre || "Usuario desconocido",
      fecha: a.fechaHora?.substring(0, 10) || "",
      hora: a.fechaHora?.substring(11, 16) || ""
    };
  });
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

      await addDoc(collection(db, "notifications"), {
        usuarioId: a.usuarioId,
        mensaje: nuevaRespuesta === "aceptada"
          ? `✔️ Tu asesoría fue aceptada por ${this.getProgramadorNombre()}`
          : `❌ Tu asesoría fue rechazada por ${this.getProgramadorNombre()}`,
        fechaHora: new Date().toISOString(),
        leido: false
      });


    alert("Respuesta enviada");

    this.ngOnInit();
  }
  getProgramadorNombre():string {
  const auth = getAuth();
  return auth.currentUser?.displayName || "Programador";
}


}
