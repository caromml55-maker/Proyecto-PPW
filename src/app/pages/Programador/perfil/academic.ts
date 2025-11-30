import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc,updateDoc } from "firebase/firestore";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-academic',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './academic.html',
  styleUrl: './academic.scss',
})
export class Academic implements OnInit{

  data: any = {
    name: '',
    especialidad: '',
    descripcion: '',
    telefono: '',
    email: '',
    photoURL: '',
    redesSociales: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  };

  isEditing = false;

  constructor() {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const userData = snap.data();
      this.data = {
        displayName: userData['name'] || '',
        especialidad: userData['especialidad'] || '',
        descripcion: userData['descripcion'] || '',
        telefono:  userData['telefono'] || '',
        email: userData['email'] || '',
        photoURL: userData['photoURL'] || '',
        redesSociales: {
          github: userData['redesSociales'].github|| '',
          linkedin: userData['redesSociales'].linkedin || '',
          portfolio: userData['redesSociales'].portfolio || ''
        }
      };
    }
  }

  cancel(){
    this.isEditing = false;
    this.ngOnInit();
  }

  async guardar() {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();
    const ref = doc(db, 'users', user!.uid);

    await updateDoc(ref, this.data);

    alert('Información actualizada');
    this.isEditing = false;
  }
}
