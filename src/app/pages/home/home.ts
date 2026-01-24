import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  constructor(private router: Router, private auth: AuthService,private apiUser: UserService ) {}

  user: any = null; 

  async ngOnInit(): Promise<void> {
    const auth = getAuth();
    const current = auth.currentUser;

    if (!current) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = current;
    /*
    try {
      const db = getFirestore();
      const snap = await getDoc(doc(db, 'users', current.uid));

      if (snap.exists()) {
        this.user.role = snap.data()['role'] ?? 'user';
      }
    } catch (err) {
      console.error('No se pudo cargar el rol', err);
    }*/
    try { 
        const dbUser = await this.apiUser.getUsuario(current.uid);
        if (dbUser) {
          this.user = { ...current, role: dbUser.role };
        }
      } catch (err) {
        console.error('Error al obtener usuario de Eclipse', err);
      }
    

  }

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error closing session', err);
    }
  }
}
