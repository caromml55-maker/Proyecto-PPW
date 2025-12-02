  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { getFirestore, collection, addDoc,getDocs } from 'firebase/firestore';  
  import { ChangeDetectorRef } from '@angular/core';
  import { FullCalendarModule } from '@fullcalendar/angular';
  import { CalendarOptions } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import { HorarioService, Horario } from '../../../services/horarios.service';
import { RouterModule } from "@angular/router";


  @Component({
    selector: 'app-horarios',
    imports: [CommonModule, FormsModule, FullCalendarModule, RouterModule],
    standalone: true,
    templateUrl: './horarios.html',
    styleUrl: './horarios.scss',
  })

  export class Horarios  implements OnInit{

    programadores: any[] = [];     
    selectedProgId: string = "";   

    fecha: string = "";            
    horaInicio: string = "";     
    horaFin: string = "";

    horarios: Horario[] = [];
    calendarEvents: any[] = [];

    isFormValid: boolean = false;
    mensajeError: string = '';
    
    // Configuración corregida del calendario
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
      eventClick: this.handleEventClick.bind(this) // ← Esta línea habilita el clic en eventos
    };
    
    constructor(private horarioService: HorarioService, private cdRef: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.cargarProgramadores();
    }

    async cargarProgramadores() {
      const db = getFirestore();
      const ref = collection(db, "users");
      const snap = await getDocs(ref);

      this.programadores = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((u: any) => u.role === "programador");

      this.cdRef.detectChanges();
    }

    // Cuando se selecciona un programador
    async onProgramadorSelected() {
      if (!this.selectedProgId) {
        this.horarios = [];
        this.calendarEvents = [];
        this.actualizarCalendario();
        return;
      }

      await this.cargarHorariosProgramador(this.selectedProgId);
    }

    // Actualizar el calendario
    actualizarCalendario() {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...this.calendarEvents]
      };
      this.cdRef.detectChanges();
    }

    // Cargar horarios del programador seleccionado
    async cargarHorariosProgramador(programadorId: string) {
      try {
        this.horarios = await this.horarioService.getHorarioByProgramador(programadorId);
        this.actualizarEventosCalendario();
      } catch (error) {
        console.error('Error cargando horarios:', error);
        alert('Error al cargar los horarios del programador');
      }
    }

    // Actualizar eventos del calendario
    actualizarEventosCalendario() {
      this.calendarEvents = this.horarios.map(horario => ({
        id: horario.id,
        title: `Disponible (${horario.inicio} - ${horario.fin})`,
        date: horario.fecha,
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        extendedProps: {
          title: "Reunion",
          inicio: horario.inicio,
          fin: horario.fin,
          programadorId: horario.programadorId
        }
      }));
      
      this.actualizarCalendario();
    }

    // Manejar clic en evento del calendario
    handleEventClick(info: any) {
      const event = info.event;
      const horarioId = event.id;
      
      if (confirm(`¿Eliminar horario del ${event.startStr}?`)) {
        this.eliminarHorario(horarioId);
      }
    }

    // Eliminar horario
    async eliminarHorario(horarioId: string) {
      try {
        await this.horarioService.eliminarHorario(horarioId);
        
        // Actualizar la lista local
        this.horarios = this.horarios.filter(h => h.id !== horarioId);
        this.actualizarEventosCalendario();
        
        alert('Horario eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando horario:', error);
        alert('Error al eliminar el horario');
      }
    }

    async guardarHorario() {
    if (!this.selectedProgId || !this.fecha || !this.horaInicio || !this.horaFin) {
      alert("Completa todos los campos");
      return;
    }

    const db = getFirestore();
    const ref = collection(db, "horarios");

    try{
        await addDoc(ref, {
        programadorId: this.selectedProgId,
        fecha: this.fecha,
        inicio: this.horaInicio,
        fin: this.horaFin
      });

      this.horarios.push({
        fecha: this.fecha,
        fin: this.horaFin,
        inicio: this.horaInicio,
        programadorId: this.selectedProgId
      })

      this.actualizarEventosCalendario();

      alert("Horario guardado correctamente");

      this.fecha = "";
      this.horaInicio = "";
      this.horaFin = "";

    }catch(error){
      console.error("Error guardando horario:", error);
      alert("Error guardando horario. Inténtalo de nuevo.");
    } 
  }

  // Obtener nombre del programador seleccionado
  getNombreProgramador(): string {
    const programador = this.programadores.find(p => p.id === this.selectedProgId);
    return programador ? (programador.displayName ? programador.displayName : 'Programador') : 'Programador';
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

  // Validar el formulario completo
  validarFormulario(): void {
    this.mensajeError = '';
    
    // Validar que todos los campos estén llenos
    if (!this.fecha || !this.horaInicio || !this.horaFin) {
      this.mensajeError = '❌ Completa todos los campos';
      this.isFormValid = false;
      return;
    }
    
    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(this.fecha)) {
      this.mensajeError = '❌ Formato de fecha inválido';
      this.isFormValid = false;
      return;
    }
    
    // Obtener la fecha actual (sin horas)
    const hoy = new Date();
    hoy.setDate(hoy.getDate()-1);
    hoy.setHours(0, 0, 0, 0);
    
    // Convertir la fecha seleccionada a Date
    const fechaSeleccionada = new Date(this.fecha);
    
    // Validar que no sea una fecha pasada
    if (fechaSeleccionada < hoy) {
      this.mensajeError = '❌ No puedes agendar en fechas pasadas';
      this.isFormValid = false;
      return;
    }
    
    // Validar formato de hora inicio
    if (!this.esHoraValida(this.horaInicio)) {
      this.mensajeError = '❌ Formato de hora inicio inválido (use HH:MM)';
      this.isFormValid = false;
      return;
    }
    
    // Validar formato de hora fin
    if (!this.esHoraValida(this.horaFin)) {
      this.mensajeError = '❌ Formato de hora fin inválido (use HH:MM)';
      this.isFormValid = false;
      return;
    }
    
    // Validar rango de hora inicio
    if (!this.esHoraEnRango(this.horaInicio)) {
      this.mensajeError = '⏰ La hora de inicio debe estar entre 7:00 y 19:00';
      this.isFormValid = false;
      return;
    }
    
    // Validar rango de hora fin
    if (!this.esHoraEnRango(this.horaFin)) {
      this.mensajeError = '⏰ La hora de fin debe estar entre 7:00 y 19:00';
      this.isFormValid = false;
      return;
    }
    
    // Validar que hora fin sea mayor que hora inicio
    if (this.horaInicio >= this.horaFin) {
      this.mensajeError = '⏰ La hora de fin debe ser posterior a la hora de inicio';
      this.isFormValid = false;
      return;
    }
    
    // Validar duración mínima (1 minutos)
    const inicio = new Date(`2000-01-01T${this.horaInicio}`);
    const fin = new Date(`2000-01-01T${this.horaFin}`);
    const diferenciaMinutos = (fin.getTime() - inicio.getTime()) / (1000 * 1);
    
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
  
}
