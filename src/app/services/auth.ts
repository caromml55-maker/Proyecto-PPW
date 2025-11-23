import { Injectable } from '@angular/core';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser } from '../../models/app-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {}

  async loginWithGoogle(): Promise<AppUser | null> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return await this.ensureUserRecord(result.user);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, provider);
          return null; // redirect will navigate away
        } catch (e) {
          console.error('Redirect login failed', e);
          throw e;
        }
      }
      throw err;
    }
  }

  async ensureUserRecord(firebaseUser: FirebaseUser) {
    if (!firebaseUser) return null;
    const db = getFirestore();
    const uid = firebaseUser.uid;
    const ref = doc(db, `users/${uid}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const newUser: AppUser = {
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        role: 'programmer',
      };
      await setDoc(ref, { ...newUser, lastLogin: serverTimestamp() });
      return newUser;
    }
    await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
    const data = snap.data() as any;
    return {
      name: data.name || data.nombre || '',
      email: data.email || data.correo || '',
      role: data.role || data.rol || 'user',
    } as AppUser;
  }

  logout() {
    const auth = getAuth();
    return signOut(auth);
  }

  getCurrentUser(): Promise<FirebaseUser | null> {
    const auth = getAuth();
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }
}
