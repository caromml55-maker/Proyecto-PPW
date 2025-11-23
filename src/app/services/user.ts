import { Injectable } from '@angular/core';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AppUser } from '../models/app-user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser: AppUser | null = null;
  unsubSnapshot: (() => void) | null = null;

  constructor() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const db = getFirestore();
        const ref = doc(db, `users/${user.uid}`);
        // detach previous
        if (this.unsubSnapshot) this.unsubSnapshot();
        this.unsubSnapshot = onSnapshot(ref, (snap) => {
          this.currentUser = snap.exists() ? (snap.data() as AppUser) : null;
        });
      } else {
        this.currentUser = null;
        if (this.unsubSnapshot) this.unsubSnapshot();
        this.unsubSnapshot = null;
      }
    });
  }

  getUser() {
    return this.currentUser;
  }
}
