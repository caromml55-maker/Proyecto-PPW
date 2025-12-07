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
      const user = result.user;
      const db = getFirestore();
      const uid = user.uid;
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      let role = 'user';

      if (!snap.exists()) {
        await setDoc(ref, {
          uid: uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: serverTimestamp(),
        });
      } else {
        const data = snap.data() as any;
        role = data.role || data.rol || 'programmer';
        
        await setDoc(ref, {
          displayName: user.displayName || data.displayName || '',
          photoURL: user.photoURL || data.photoURL || '',
          email: user.email || data.email || '',
        }, { merge: true });
      }
      

      if (role === 'admin') this.router.navigate(['/admin']);
      else if (role === 'programador') this.router.navigate(['/programador']);
      else this.router.navigate(['/usuario']);
      
    } catch (error) {
      console.error('Error de autenticación', error);
      const errCode = (error as any)?.code;
      if (
        errCode === 'auth/cancelled-popup-request' ||
        errCode === 'auth/popup-blocked' ||
        errCode === 'auth/popup-closed-by-user'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e) {
          console.error('Fallback redirect failed', e);
          alert('Error en redirect: ' + ((e as any)?.message || String(e)));
        }
      }
    }
  }
}
