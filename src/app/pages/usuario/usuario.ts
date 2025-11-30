import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss']
})
export class Usuario implements OnInit {
   programadores: any[] = [];
  uidUsuario = "";

  uidProgramadorSeleccionado = "";
  fecha = "";
  hora = "";
  comentario = "";

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit(){
    const auth = getAuth();
    this.uidUsuario = auth.currentUser?.uid || "";

    const db = getFirestore();
    const snap = await getDocs(collection(db, "users"));

    this.programadores = snap.docs
      .map(d => ({ uid: d.id, ...d.data() }))
      .filter((u: any) => u.role === "programador");

    this.cdRef.detectChanges();
  }

  async solicitar(){
    if (!this.uidProgramadorSeleccionado || !this.fecha || !this.hora) {
      alert("Debes completar programador, fecha y hora");
      return;
    }

    const db = getFirestore();
    await addDoc(collection(db,"asesorias"),{
      uidProgramador: this.uidProgramadorSeleccionado,
      uidUsuarioSolicitante: this.uidUsuario,
      fecha: this.fecha,
      hora: this.hora,
      comentario: this.comentario || "",
      estado: "pendiente",
      respuesta: "",
      fechaSolicitud: new Date()
    });

  }

}
