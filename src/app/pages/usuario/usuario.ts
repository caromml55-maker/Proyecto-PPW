import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import {CalendarOptions} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { ChangeDetectorRef } from '@angular/core';

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
  eventoSeleccionado: any = null;
  showNotifications: boolean = false;

  viendoPortafolios = false;
  portafoliosAcademicos:any[] = [];
  portafoliosLaborales:any[] = [];



  eventosCalendar: any[] = [];
  horaSeleccionada = "";
  comentario = "";
  userName = "";
  selectedEventId: string | null = null;
  calendarReady = false;
  loading = false;

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
    eventClick: (info) => this.onEventClick(info),
    // Configuración para permitir selección de eventos
    eventDisplay: 'block',
    eventColor: '#3788d8' // Color por defecto
  };


  constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loading = true;
    await this.cargarUsuario();
    await this.cargarProgramadores();
    await this.cargarNotificaciones();
    this.loading = false;
    this.cdRef.detectChanges();
  }


  async cargarUsuario() {
    const auth = getAuth();
    this.userName = auth.currentUser?.displayName || "";
  }

  async cargarProgramadores() {
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
    const q = query(ref, where("usuarioId", "==", user.uid), orderBy("fechaHora", "desc"));
    const snap = await getDocs(q);

    this.notificaciones = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    this.cdRef.detectChanges();
  }

  // Limpiar todas las notificaciones
  limpiarNotificaciones() {
    this.notificaciones = [];
    this.showNotifications = false;
  }

  // Mostrar/ocultar notificaciones
  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  // Marcar todas como leídas
  marcarTodasComoLeidas() {
    this.notificaciones.forEach(n => this.marcarComoLeida(n.id));
  }

  // Cerrar dropdown si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isNotificationBtn = target.closest('.notification-btn');
    const isInsideDropdown = target.closest('.notification-dropdown');
    
    if (!isNotificationBtn && !isInsideDropdown) {
      this.showNotifications = false;
    }
  }

  // Al hacer clic en una notificación
  async onClickNotificacion(notificacion: any) {
    // Mostrar alert con detalles
    this.mostrarDetallesNotificacion(notificacion);
    
    // Marcar como leída en Firebase si no lo está
    if (!notificacion.leida) {
      await this.marcarComoLeida(notificacion.id);
      notificacion.leida = true;
    }
  }

  // Mostrar detalles en alert
  mostrarDetallesNotificacion(notificacion: any) {
    let detalles = `📋 ${notificacion.mensaje}\n\n`;
    
    detalles += `👤 Tipo: Asesoría\n`;
      detalles += `📅 Fecha: ${this.getFechaFromISO(notificacion.fechaHora)}\n`;
    detalles += `⏰ Hora: ${this.getHoraFromISO(notificacion.fechaHora)}\n`;
    
    // Mostrar alert con opciones
    alert(`${detalles}`);
    
    this.marcarComoLeida(notificacion.id);
    this.cdRef.detectChanges();
  }

  // Marcar como leída en Firebase
  async marcarComoLeida(id: string) {
    try {
      const db = getFirestore();
      const ref = doc(db, "notifications", id);
      
      await updateDoc(ref, {
        leido: true
      });

      this.cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  // En tu componente TypeScript
  getNotificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leido).length;
  }

  verAsesoria(programador: any){
    this.seleccionado = programador;
    this.cargarHorarios(programador.uid);
  }

  volver(){
    this.seleccionado = null;
    this.eventoSeleccionado = null;
    this.horaSeleccionada = "";
    this.selectedEventId = null;
    this.comentario = "";
  }

  async verPortafolios(p:any){
    this.seleccionado = p;
    this.viendoPortafolios = true;

    const db = getFirestore();
    const ref = collection(db, "portafolios");
    const q = query(ref, where("uidProgramador","==",p.uid))
    const snap = await getDocs(q);

    snap.forEach(doc=>{
          const data:any = doc.data();
          this.portafoliosAcademicos = data.proyectosAcademicos || [];
          this.portafoliosLaborales = data.proyectosLaborales  || [];
      })
    
  }


  async cargarHorarios(uid:string) {

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
    this.cdRef.detectChanges();
  }


  async agendarAsesoria() {
    this.cargarUsuario()
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
      usuarioId: user?.uid,
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
    if (this.eventoSeleccionado) {
      this.eventoSeleccionado.setProp('backgroundColor', '#28a745');
      this.eventoSeleccionado.setProp('borderColor', '#28a745');
    }
    this.eventoSeleccionado = null;
    this.horaSeleccionada = "";
    this.selectedEventId = null;
    this.comentario = "";
    this.cdRef.detectChanges();
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
    // Deseleccionar evento si existe es el mismo
    if (this.eventoSeleccionado?.id == info.event.id) {
      this.eventoSeleccionado.setProp('backgroundColor', '#28a745');
      this.eventoSeleccionado.setProp('borderColor', '#28a745');
      this.eventoSeleccionado = null;
      this.selectedEventId = null;
      this.cdRef.detectChanges();
      return;
    }

    // Deseleccionar evento anterior si existe
    if (this.eventoSeleccionado) {
      this.eventoSeleccionado.setProp('backgroundColor', '#28a745');
      this.eventoSeleccionado.setProp('borderColor', '#28a745');
    }

    // ACTUALIZAR COLORES CORRECTAMENTE
    this.eventoSeleccionado = info.event;
    this.eventoSeleccionado.setProp('backgroundColor', '#0d6efd');
    this.eventoSeleccionado.setProp('borderColor', '#0d6efd');

    this.horaSeleccionada = this.eventoSeleccionado.startStr;
    this.selectedEventId = this.eventoSeleccionado.id;

    console.log("EVENTO SELECCIONADO:", this.horaSeleccionada);
    this.calendarOptions = { ...this.calendarOptions };
    this.cdRef.detectChanges();
  }

  // Extraer fecha (YYYY-MM-DD) desde ISO
  getFechaFromISO(isoString: string): string {
    if (!isoString) return 'No especificada';
    
    try {
      const fecha = new Date(isoString);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      // Formato: "02 de diciembre de 2025"
      const opciones: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // Extraer hora (HH:MM) desde ISO
  getHoraFromISO(isoString: string): string {
    if (!isoString) return 'No especificada';
    
    try {
      const fecha = new Date(isoString);
      if (isNaN(fecha.getTime())) return 'Hora inválida';
      
      // Formato: "00:27" (24 horas)
      return fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'Hora inválida';
    }
  }

  cerrarPortafolios(){
  this.viendoPortafolios = false;
   this.seleccionado = null;
}

}
