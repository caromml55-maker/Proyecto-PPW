import { Component, OnInit } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notificaciones',
  imports: [RouterModule, CommonModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
})
export class Notificaciones implements OnInit {

  lista: any[] = [];
  uidProgramador = "";

  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    this.uidProgramador = auth.currentUser?.uid || "";

    const db = getFirestore();
    const ref = collection(db, "notifications");
    const q = query(ref, where("receptorId", "==", this.uidProgramador));
    const snap = await getDocs(q);

    this.lista = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }

  async marcarLeido(n: any) {
    const db = getFirestore();
    const ref = doc(db, "notifications", n.id);
    await updateDoc(ref, { leido: true });
    n.leido = true;
  }

}


