
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  constructor(private auth: Auth, private router: Router) {}

  user: any = null;

  ngOnInit(): void {
    this.user = (this.auth as any).currentUser ?? null;
  }

  async logout() {
    try {
      await signOut(this.auth as any);
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error closing session', err);
    }
  }
}
