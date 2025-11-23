import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  constructor(private router: Router) {}

  async login() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Usuario autenticado', result.user);

      // Persist user in Firestore. New users default to role 'programmer'.
      try {
        const db = getFirestore();
        const uid = result.user.uid;
        const uRef = doc(db, 'users', uid);
        const snap = await getDoc(uRef);
        if (!snap.exists()) {
          await setDoc(uRef, {
            uid,
            name: result.user.displayName || '',
            email: result.user.email || '',
            role: 'programmer',
            lastLogin: serverTimestamp(),
          });
        } else {
          await setDoc(uRef, { lastLogin: serverTimestamp() }, { merge: true });
        }
      } catch (e) {
        console.warn('No se pudo persistir usuario en Firestore', e);
      }

      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error de autenticación', error);
      const errCode = (error as any)?.code;
      // If popup flow fails (blocked/cancelled), fallback to redirect
      if (errCode === 'auth/cancelled-popup-request' || errCode === 'auth/popup-blocked' || errCode === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e) {
          console.error('Fallback redirect failed', e);
          alert('Error en el inicio de sesión (redirect): ' + ((e as any)?.message || String(e)));
          return;
        }
      }
      const msg = (error as any)?.message || String(error);
      alert('Error en el inicio de sesión: ' + msg);
    }
  }
}
