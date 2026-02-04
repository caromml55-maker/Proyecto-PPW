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
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, FullCalendarModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss']
})
export class Usuario implements OnInit {

  private apiBase = 'http://localhost:8080/gproyectoFinal/api';

  programadores: any[] = [];
  seleccionado: any = null;
  notificaciones: any[] = [];
  eventoSeleccionado: any = null;
  showNotifications: boolean = false;

  viendoPortafolios = false;
  portafoliosAcademicos: any[] = [];
  portafoliosLaborales: any[] = [];

  eventosCalendar: any[] = [];
  horaSeleccionada = "";
  comentario = "";
  userName = "";
  selectedEventId: string | null = null;
  
  calendarReady = false;
  loading = false;
  loadingPortafolios = false;

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
    eventDisplay: 'block',
    eventColor: '#3788d8' // Color por defecto
  };

  constructor(private router: Router,private cdRef: ChangeDetectorRef,private http: HttpClient) {}


  async ngOnInit() {
    this.loading = true;

    const auth = getAuth();
    if (auth.currentUser) {
      this.userName = auth.currentUser.displayName || "Usuario";

      await Promise.all([
        this.cargarProgramadores(),
        this.cargarNotificaciones()
      ]);
    }
    this.loading = false;
    this.cdRef.detectChanges();
  }

  async cargarProgramadores() {
    try {
      this.programadores = await firstValueFrom(this.http.get<any[]>(`${this.apiBase}/users/programadores`));
    } catch (error) {
      console.error("Error cargando programadores", error);
      this.programadores = [];
    }
  }

  async cargarNotificaciones() {
    const auth = getAuth();
    if (!auth.currentUser) return;

    try {
      const data: any = await firstValueFrom(this.http.get(`${this.apiBase}/notification/usuario/${auth.currentUser.uid}`));
      this.notificaciones = data || [];
    } catch (error) {
      console.error("Error cargando notificaciones", error);
      this.notificaciones = [];
    }
    this.cdRef.detectChanges();
  }

  verAsesoria(programador: any) {
    this.seleccionado = programador;
    this.cargarHorarios(programador.uid);
  }

  async cargarHorarios(uid:string) {
    const auth = getAuth();
    const miUid = auth.currentUser?.uid || "";

    this.calendarReady = false;
    try {
      const url = `${this.apiBase}/horario/programador/${uid}/visto-por/${miUid}`;
      const horarios: any[] = await firstValueFrom(this.http.get<any[]>(`${this.apiBase}/horario/programador/${uid}`));
      
      this.eventosCalendar = horarios.map(h => {
        let color = '#28a745'; // LIBRE (Verde)
        let title = `Disponible (${h.modalidad})`;
        let isClickable = true;

        if (h.estado === 'MIO') {
          color = '#ffc107'; // AMARILLO (Reservado por mí)
          title = '🟡 Reservado (Clic para cancelar)';
        } else if (h.estado === 'OCUPADO') {
          color = '#6c757d'; // GRIS (Ocupado por otro)
          title = '🔴 Ocupado';
          isClickable = false; // No se puede interactuar
        }

      return {
        id: h.idHorario,
        extendedProps: { 
            estado: h.estado, 
            idAsesoria: h.idAsesoria // ID necesario para cancelar
        },
        title: title,
        start: `${h.fecha}T${h.inicio}`,
        end: `${h.fecha}T${h.fin}`,
        backgroundColor: color,
        borderColor: color,
        display: 'block',
        classNames: isClickable ? ['clickable-event'] : ['disabled-event']
      };
    });
      

      this.actualizarCalendario();
    } catch (error) {
      console.error("Error cargando horarios", error);
      this.eventosCalendar = [];
    }
    this.calendarReady = true;
    this.cdRef.detectChanges();
  }

  async agendarAsesoria() {
    const auth = getAuth();
    if (!auth.currentUser) return;

    if (!this.horaSeleccionada || !this.selectedEventId) {
      alert("Primero selecciona un horario del calendario.");
      return;
    }

    const body = {
      programadorUid: this.seleccionado.uid,
      usuarioUid: auth.currentUser.uid,
      fechaHora: this.horaSeleccionada,
      comentario: this.comentario
    };

    try {
      await firstValueFrom(this.http.post(`${this.apiBase}/asesoria`, body));
      this.eventosCalendar = this.eventosCalendar.map(e => {
        if (String(e.id) === String(this.selectedEventId)) {
            return {
                ...e,
                title: 'Solicitado',
                backgroundColor: '#ffc107', 
                borderColor: '#ffc107',
                display: 'block' 
            };
        }
        return e;
    });
      
      this.actualizarCalendario();
      alert("✅ Solicitud enviada correctamente.");
      this.limpiarSeleccion();

    } catch (error: any) {
      console.error("Error al agendar:", error);
      
      if (error.status === 409) {
       alert("⚠️ Ya existe una solicitud para este horario.");
    } else if (error.status === 200 || error.status === 201) {
       alert("✅ Solicitud enviada correctamente (texto).");
       this.cargarHorarios(this.seleccionado.uid); 
    } else {
       alert("❌ Error al procesar la solicitud. Revisa la consola.");
    }
  }
  }

  async verPortafolios(p:any) {
    this.loadingPortafolios = true;
    this.seleccionado = p;
    this.viendoPortafolios = true;

    try {
      const portafolio: any = await firstValueFrom(this.http.get(`${this.apiBase}/users/portafolio/${p.uid}`));
      
      if (portafolio && portafolio.proyectos) {
        this.portafoliosAcademicos = portafolio.proyectos.filter((p: any) => p.tipo === 'academico');
        this.portafoliosLaborales = portafolio.proyectos.filter((p: any) => p.tipo === 'laboral');
      } else {
        this.portafoliosAcademicos = [];
        this.portafoliosLaborales = [];
      }

    } catch (error) {
      console.error("Error cargando portafolios", error);
      this.portafoliosAcademicos = [];
      this.portafoliosLaborales = [];
    }
    this.loadingPortafolios = false;
    this.cdRef.detectChanges();
  }

  async marcarComoLeida(id: string) {
    try {
      await firstValueFrom(this.http.put(`${this.apiBase}/notification/${id}/leido`, {}));
      const notif = this.notificaciones.find(n => n.id === id);
      if (notif) notif.leido = true;
      //this.cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  async marcarTodasComoLeidas() {
    this.notificaciones.forEach(n => {
      if (!n.leido) this.marcarComoLeida(n.id);
    });
  }

  limpiarSeleccion() {
    if (this.eventoSeleccionado) {
      const color = this.eventoSeleccionado.title.includes('virtual') ? '#17a2b8' : '#28a745';
      this.eventoSeleccionado.setProp('backgroundColor', color);
      this.eventoSeleccionado.setProp('borderColor', color);
    }
    this.eventoSeleccionado = null;
    this.horaSeleccionada = "";
    this.selectedEventId = null;
    this.comentario = "";
  }

  actualizarCalendario() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.eventosCalendar]
    };
    this.cdRef.detectChanges();
  }

  onEventClick(info: any) {
  const props = info.event.extendedProps;

  // CASO 1: Es una cita ajena (Gris) -> No hacer nada
  if (props.estado === 'OCUPADO') {
    alert("Este horario ya está reservado por otra persona.");
    return;
  }

  // CASO 2: Es MI cita (Amarillo) -> Cancelar
  if (props.estado === 'MIO') {
    if (confirm("¿Quieres cancelar esta asesoría? El horario volverá a estar disponible.")) {
      this.cancelarAsesoria(props.idAsesoria);
    }
    return; // Salimos, no seleccionamos nada
  }

  // CASO 3: Es libre (Verde) -> Seleccionar para agendar
  // (Tu lógica de selección anterior para ponerlo Azul)
  this.limpiarSeleccion(); // Limpiar previos
  
  this.eventoSeleccionado = info.event;
  this.eventoSeleccionado.setProp('backgroundColor', '#0d6efd'); // Azul selección
  this.eventoSeleccionado.setProp('borderColor', '#0d6efd');

  this.horaSeleccionada = this.eventoSeleccionado.startStr;
  this.selectedEventId = this.eventoSeleccionado.id;
  this.cdRef.detectChanges();
}

// Nuevo método para cancelar
async cancelarAsesoria(idAsesoria: number) {
  try {
    this.loading = true;
    // DELETE /asesoria/{id}
    await firstValueFrom(this.http.delete(`${this.apiBase}/asesoria/${idAsesoria}`));
    
    alert("✅ Asesoría cancelada. Se ha notificado al programador.");
    
    // Recargamos el calendario para que se vuelva a poner verde
    this.cargarHorarios(this.seleccionado.uid);
  } catch (error) {
    console.error(error);
    alert("Error al cancelar la asesoría.");
  } finally {
    this.loading = false;
  }
}

  getNotificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leido).length;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  volver() {
    this.seleccionado = null;
    this.limpiarSeleccion();
  }
  
  cerrarPortafolios(){
    this.viendoPortafolios = false;
    this.seleccionado = null;
  }

  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigate(['/']);
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isNotificationBtn = target.closest('.notification-btn');
    const isInsideDropdown = target.closest('.notification-dropdown');
    if (!isNotificationBtn && !isInsideDropdown) {
      this.showNotifications = false;
    }
  }

  onClickNotificacion(n: any) {
      // Mostrar detalles (puedes usar tu método mostrarDetallesNotificacion aquí)
      alert(n.mensaje);
      if(!n.leido) this.marcarComoLeida(n.id);
  }








/*


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

  // M

  

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
  }*/
}
