  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { getFirestore, collection, addDoc,getDocs } from 'firebase/firestore';  
  import { ChangeDetectorRef } from '@angular/core';
  import { FullCalendarModule } from '@fullcalendar/angular';
  import { CalendarOptions } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import { HorarioService, Horario } from '../../../services/horario.service';
  import { RouterModule } from "@angular/router";
  import { getAuth } from 'firebase/auth';


  @Component({
    selector: 'app-horarios',
    imports: [CommonModule, FormsModule, FullCalendarModule, RouterModule],
    standalone: true,
    templateUrl: './horarios.html',
    styleUrl: './horarios.scss',
  })

  export class Horarios  implements OnInit{

    uidProgramador: string = "";     

    fecha: string = "";            
    horaInicio: string = "";     
    horaFin: string = "";
    modalidad: string = "";

    horarios: Horario[] = [];
    calendarEvents: any[] = [];

    isFormValid: boolean = false;
    mensajeError: string = '';
    loading: boolean = false;
    
    calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'es',
      events: this.calendarEvents,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      editable: false,
      selectable: false,
      weekends: true,
      eventColor: '#3788d8',
      eventClick: this.handleEventClick.bind(this) 
    };
    
    constructor(private horarioService: HorarioService, private cdRef: ChangeDetectorRef) {}

    ngOnInit(): void {
      const auth = getAuth();
    if (auth.currentUser) {
      this.uidProgramador = auth.currentUser.uid;
      this.cargarHorarios();
    } else {
      console.error("No hay usuario logueado");
    }
    }

    cargarHorarios() {
    this.loading = true;
    this.horarioService.getHorarioByProgramadorAPI(this.uidProgramador).subscribe({
      next: (data) => {
        this.horarios = data;
        this.actualizarEventosCalendario();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert("Error cargando tus horarios");
      }
    });
  }


  guardarHorario() {
    console.log("Intentando guardar horario...");
    console.log("Fecha:", this.fecha);
    console.log("Hora Inicio:", this.horaInicio);
    console.log("Hora Fin:", this.horaFin);
    console.log("Modalidad:", this.modalidad);
    this.validarFormulario();
    if (!this.isFormValid) return;

    const nuevoHorario: Horario = {
      programadorUid: this.uidProgramador,
      fecha: this.fecha,
      inicio: this.horaInicio,
      fin: this.horaFin,
      modalidad: this.modalidad
    };
    console.log("Guardando horario:", nuevoHorario);
    this.loading = true;
    this.horarioService.guardarHorarioAPI(nuevoHorario).subscribe({
      next: () => {
        alert("✅ Horario registrado con éxito");
        this.limpiarFormulario();
        this.cargarHorarios(); // Recargar lista
      },
      error: (err) => {
        console.error(err);
        alert("❌ Error al guardar. Intenta nuevamente.");
        this.loading = false;
      }
    });
  }


  
  eliminarHorario(idStr: string) {
    const id = Number(idStr);
    this.horarioService.eliminarHorarioAPI(id).subscribe({
      next: () => {
        this.horarios = this.horarios.filter(h => h.id !== id);
        this.actualizarEventosCalendario();
        console.log("Horario eliminado:", id);
        alert("🗑️ Horario eliminado");
        this.cargarHorarios();
      },
      error: err => alert("Error eliminando: " + err.message)
    });
  }

  handleEventClick(info: any) {

    if (confirm("¿Eliminar horario?")) {
      this.eliminarHorario(info.event.id);
    }
  }

  actualizarEventosCalendario() {
    this.calendarEvents = this.horarios.map(h => {
      const color = h.modalidad === 'virtual' ? '#17a2b8' : '#28a745';
      return {
        id: h.id?.toString(),
        title: `${h.inicio}-${h.fin} (${h.modalidad})`,
        date: h.fecha,
        backgroundColor: color,
        borderColor: color
      };
    });
    this.actualizarCalendario();
  }

  actualizarCalendario() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };
    this.cdRef.detectChanges();
  }

  getFechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  getFechaMaxima(): string {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 meses en el futuro
    return maxDate.toISOString().split('T')[0];
  }

 validarFormulario(): void {
    this.mensajeError = '';
    
    // 1. Validar campos vacíos
    if (!this.fecha || !this.horaInicio || !this.horaFin || !this.modalidad) {
      this.mensajeError = '❌ Completa todos los campos';
      this.isFormValid = false;
      return;
    }
    
    // 2. Validar formato de fecha y hora (Regex)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(this.fecha)) {
      this.mensajeError = '❌ Formato de fecha inválido';
      this.isFormValid = false;
      return;
    }
    
    if (!this.esHoraValida(this.horaInicio) || !this.esHoraValida(this.horaFin)) {
      this.mensajeError = '❌ Formato de hora inválido';
      this.isFormValid = false;
      return;
    }
    const ahora = new Date(); // Fecha y hora actual exacta
    const inicioSeleccionado = new Date(`${this.fecha}T${this.horaInicio}`);
    const finSeleccionado = new Date(`${this.fecha}T${this.horaFin}`);

    // Validar que la fecha/hora de inicio no sea anterior al momento actual
    if (inicioSeleccionado < ahora) {
      this.mensajeError = '❌ No puedes agendar en una fecha u hora pasada';
      this.isFormValid = false;
      return;
    }

    // 4. Validar que hora fin sea mayor que hora inicio
    if (inicioSeleccionado >= finSeleccionado) {
      this.mensajeError = '⏰ La hora de fin debe ser posterior a la hora de inicio';
      this.isFormValid = false;
      return;
    }

    // 5. Validar rangos de horario laboral (7am a 7pm)
    if (!this.esHoraEnRango(this.horaInicio) || !this.esHoraEnRango(this.horaFin)) {
      this.mensajeError = '⏰ El horario debe estar entre 7:00 y 19:00';
      this.isFormValid = false;
      return;
    }
    
    // 6. Validar duración mínima (1 minuto)
    const diferenciaMinutos = (finSeleccionado.getTime() - inicioSeleccionado.getTime()) / 60000;
    
    if (diferenciaMinutos < 1) {
      this.mensajeError = '⏰ La duración mínima debe ser de 1 minuto';
      this.isFormValid = false;
      return;
    }
    
    // Si pasa todas las validaciones
    this.isFormValid = true;
  }

    // Método para validar hora (formato HH:MM)
  private esHoraValida(hora: string): boolean {
    if (!hora || hora.trim() === '') return false;
    
    // Verificar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(hora)) return false;
    
    return true;
  }
  
  // Validar hora entre 7am y 7pm
  private esHoraEnRango(hora: string): boolean {
    if (!this.esHoraValida(hora)) return false;
    
    const [horas] = hora.split(':').map(Number);
    
    // Validar entre 7 (7am) y 19 (7pm)
    return horas >= 7 && horas <= 19;
  }

  // Método para formatear hora (asegura formato HH:MM)
  formatearHora(hora: string): string {
    if (!hora) return '';
    
    // Si la hora viene como "7:00", convertir a "07:00"
    const partes = hora.split(':');
    if (partes.length === 2) {
      const horas = partes[0].padStart(2, '0');
      const minutos = partes[1].padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    
    return hora;
  }

  // Método para capturar cambios en hora inicio
  onHoraInicioChange(event: any) {
    this.horaInicio = this.formatearHora(event.target.value);
    this.validarFormulario();
  }
  
  // Método para capturar cambios en hora fin
  onHoraFinChange(event: any) {
    this.horaFin = this.formatearHora(event.target.value);
    this.validarFormulario();
  }

  limpiarFormulario() {
    this.fecha = "";
    this.horaInicio = "";
    this.horaFin = "";
    this.modalidad = "";
    this.isFormValid = false;
  }
  
}
