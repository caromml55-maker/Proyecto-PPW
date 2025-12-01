import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import {CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, FullCalendarModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss']
})
export class Usuario implements OnInit {
  programadores: any[] = [];
  seleccionado: any = null;
  notificaciones: any[] = [];

  eventosCalendar: any[] = [];
  horaSeleccionada = "";
  comentario = "";
  userName = "";
  selectedEventId: string | null = null;
  calendarReady = false;


  constructor(private router: Router) {}

  async ngOnInit(){
    setTimeout(async () => {
    await this.cargarUsuario();
    await this.cargarProgramadores();
    await this.cargarNotificaciones(); 
  }, 200);
}


  async cargarUsuario(){
  const auth = getAuth();
  this.userName = auth.currentUser?.displayName || "";
}

async cargarProgramadores(){
  const db = getFirestore();
  const ref = collection(db, "users");
  const snap = await getDocs(ref);

  this.programadores = snap.docs.map(d => {
    const data = d.data();

    return {
      idDoc: d.id,          
      uid: data['uid'],        
      name: data['displayName'] || data['name'] || "",
      especialidad: data['especialidad'] || "",
      photoURL: data['photoURL'] || "",
      role:  data['role']
    };
  }).filter((u:any) => u.role === "programador");
}

async cargarNotificaciones(){
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const db = getFirestore();
  const ref = collection(db, "notifications");
  const q = query(ref, where("usuarioId", "==", user.uid));
  const snap = await getDocs(q);

  this.notificaciones = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}




verAsesoria(programador: any){
  this.seleccionado = programador;
  this.cargarHorarios(programador.uid);
}

volver(){
  this.seleccionado = null;
}

calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'es',
  selectable: false,
  events: this.eventosCalendar,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  eventClick: (info) => this.onEventClick(info) 
};

async cargarHorarios(uid:string){

  const db = getFirestore();
  const ref = collection(db, "horarios");
  const q = query(ref, where("programadorId", "==", uid));
  const snap = await getDocs(q);

  this.eventosCalendar = snap.docs.map(d => {
    const h: any = d.data();
    return {
      id: d.id,                          
      title: "Disponible",
      start: `${h.fecha}T${h.inicio}`,
      end:   `${h.fecha}T${h.fin}`,
      backgroundColor: '#28a745',      
      borderColor: '#28a745'
    };
  });

  this.calendarOptions = {
    ...this.calendarOptions,
    events: [...this.eventosCalendar]
  };

  this.calendarReady = true;
}


async agendarAsesoria(){
  if (!this.horaSeleccionada || !this.selectedEventId) {
    alert("Primero selecciona un horario del calendario.");
    return;
  }

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  await addDoc(collection(db, "asesorias"), {
    programadorId: this.seleccionado.uid,
    usuarioId: user?.uid,
    fechaHora: this.horaSeleccionada,
    comentario: this.comentario,
    estado: "pendiente"
  });

  await addDoc(collection(db, "notifications"), {
    usuarioId: this.seleccionado.id,   
    mensaje: `📩 Nueva solicitud de asesoría de ${this.userName}`,
    fechaHora: new Date().toISOString(),
    leido: false
  });

  this.eventosCalendar = this.eventosCalendar.map(e => {
    if (e.id === this.selectedEventId) {
      return {
        ...e,
        title: "Solicitado",
        backgroundColor: '#fadb7dff', // amarillo
        borderColor: '#ffc107'
      };
    }
    return e;
  });


  this.actualizarCalendario();

  alert("La solicitud fue enviada al programador 👍");

  // Limpiar selección pero quedarnos en la misma vista
  this.horaSeleccionada = "";
  this.selectedEventId = null;
  this.comentario = "";
}


    logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigate(['/']);
    });
  }
  actualizarCalendario(){
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.eventosCalendar]
    };
  }

 onEventClick(info: any) {
  const event = info.event;

  this.horaSeleccionada = event.startStr;   
  this.selectedEventId = event.id;     

  console.log("EVENTO SELECCIONADO:", this.horaSeleccionada);

  // ACTUALIZAR COLORES CORRECTAMENTE
  this.calendarOptions.events = this.eventosCalendar.map(e => ({
    ...e,
    backgroundColor: e.id === event.id ? '#0d6efd' : '#28a745',
    borderColor:     e.id === event.id ? '#0d6efd' : '#28a745'
  }));

  this.calendarOptions = { ...this.calendarOptions };
}

}
