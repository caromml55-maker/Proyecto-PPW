import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';
import { ReporteService } from '../../../services/reporte-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporte-admin',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule,FormsModule],
  templateUrl: './reporte-admin.html',
  styleUrl: './reporte-admin.scss',
})

export class ReporteAdmin implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Variables para el flujo de pantallas
  programadores: any[] = [];
  programadorSeleccionado: any = null; 

  filteredProgramadores: any[] = [];
  searchTextProg: string = '';
  isOpenProg: boolean = false;
  selectedUid: string | null = null;

  dataAsesorias: any[] = [];
  dataProyectos: any[] = [];

  // KPI's
  totalAsesorias = 0;
  totalProyectos = 0;
  tasaAceptacion = 0;

  // --- GRÁFICAS CONFIG ---
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Cantidad', backgroundColor: [], borderRadius: 5 }]
  };

  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
    cutout: '70%'
  };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  constructor(
    private reporteService: ReporteService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

 ngOnInit(): void {
    this.loadProgramadores();
  }

  // ---------------------------------------------------------
  // PASO 1: OBTENER LISTA DE PROGRAMADORES (API 1)
  // ---------------------------------------------------------
  loadProgramadores() {
    this.reporteService.getProgramadores().subscribe({
      next: (data) => {
        console.log("✅ API 1 - Programadores cargados:", data);
        this.programadores = data;
        this.filteredProgramadores = [...this.programadores]; 
        this.cd.detectChanges();
      },
      error: (e) => console.error("❌ Error cargando programadores:", e)
    });
  }

  // ---------------------------------------------------------
  // PASO 2: LÓGICA DEL SELECTOR Y OBTENCIÓN DEL UID
  // ---------------------------------------------------------
  
  // Filtrar en el buscador
  filterOptionsProg() {
    if (!this.searchTextProg.trim()) {
      this.filteredProgramadores = [...this.programadores];
      return;
    }
    const term = this.searchTextProg.toLowerCase().trim();
    this.filteredProgramadores = this.programadores.filter(p => {
      // Validamos displayName, name o email para que no falle si alguno es null
      const name = (p.displayName || p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  // Mostrar texto en el input
  getDisplayTextProg(): string {
    if (!this.programadorSeleccionado) return '';
    return `${this.programadorSeleccionado.displayName || this.programadorSeleccionado.name} (${this.programadorSeleccionado.email})`;
  }

  toggleDropdownProg() {
    this.isOpenProg = !this.isOpenProg;
    if (this.isOpenProg) {
        this.searchTextProg = '';
        this.filteredProgramadores = [...this.programadores];
    }
  }

  // AL SELECCIONAR UN PROGRAMADOR
  selectProgramador(programador: any) {
    console.log("👉 Usuario ha seleccionado:", programador);

    // 1. Guardamos los datos de la API 1
    this.selectedUid = programador.uid;
    this.programadorSeleccionado = programador;
    
    // 2. Cerramos el menú
    this.isOpenProg = false;
    this.searchTextProg = '';

    // 3. PASAMOS EL UID A LA OTRA API
    if (this.selectedUid) {
        this.cargarDatosDelProgramador(this.selectedUid);
    }
  }

  // Cerrar si clicamos fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-combobox')) {
      this.isOpenProg = false;
    }
  }

  // ---------------------------------------------------------
  // PASO 3: PROCESAR DATOS (Corregido para contar manualmente)
  // ---------------------------------------------------------
  cargarDatosDelProgramador(uid: string) {
    console.log("🔄 Solicitando reporte para UID:", uid);
    
    // Resetear
    this.totalAsesorias = 0;
    this.totalProyectos = 0;
    this.tasaAceptacion = 0;
    
    // --- A. OBTENER ASESORÍAS ---
    this.reporteService.getDetalleAsesorias(uid).subscribe({
      next: (data) => {
        this.dataAsesorias = data;
        
        // 1. KPI TOTAL: Es simplemente el largo del array
        this.totalAsesorias = data.length;

        // 2. KPI TASA ACEPTACIÓN
        // Filtramos las que dicen 'aceptada' y contamos el largo del array resultante
        const aceptadas = data.filter(d => d.estado?.toLowerCase() === 'aceptada').length;
        
        this.tasaAceptacion = this.totalAsesorias > 0 
            ? Math.round((aceptadas / this.totalAsesorias) * 100) 
            : 0;

        // 3. PREPARAR GRÁFICA DE BARRAS (Agrupar y contar)
        // Convertimos la lista plana en un objeto: { 'pendiente': 8, 'rechazada': 1 }
        const conteo = this.agruparPorPropiedad(data, 'estado');
        const etiquetas = Object.keys(conteo);
        const valores = Object.values(conteo);

        this.barChartData = {
          labels: etiquetas,
          datasets: [{
            data: valores,
            label: 'Solicitudes',
            backgroundColor: etiquetas.map(e => this.getColorEstado(e)),
            borderRadius: 8,
            barThickness: 40
          }]
        };

        this.chart?.update();
        this.cd.detectChanges();
      },
      error: (e) => {
        console.error("❌ Error en Asesorías:", e);
        this.dataAsesorias = [];
      }
    });

    // --- B. OBTENER PROYECTOS ---
    this.reporteService.getDetalleProyectos(uid).subscribe({
      next: (data) => {
        this.dataProyectos = data;

        // 1. KPI TOTAL
        this.totalProyectos = data.length;

        // 2. PREPARAR GRÁFICA DE DONA
        // Nota: En tu log salía la propiedad 'tipo', no 'tipoProyecto'. Usamos 'tipo'.
        const conteo = this.agruparPorPropiedad(data, 'tipo'); 
        
        this.pieChartData = {
            labels: Object.keys(conteo),
            datasets: [{
              data: Object.values(conteo),
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
              hoverOffset: 4
            }]
        };

        this.chart?.update();
        this.cd.detectChanges();
      },
      error: (e) => {
        console.error("❌ Error en Proyectos:", e);
        this.dataProyectos = [];
      }
    });
  }

  // --- FUNCIÓN AUXILIAR PARA CONTAR ---
  // Recibe el array de datos y el nombre del campo por el cual agrupar (ej: 'estado')
  agruparPorPropiedad(data: any[], propiedad: string): { [key: string]: number } {
    return data.reduce((acc, curr) => {
      // Obtenemos el valor (ej: 'pendiente') o 'Sin Definir' si viene null
      const llave = curr[propiedad] || 'Sin Definir'; 
      // Sumamos 1 al contador de esa llave
      acc[llave] = (acc[llave] || 0) + 1;
      return acc;
    }, {});
  }
  // --- UTILIDADES ---
  getColorEstado(estado: string): string {
    if (!estado) return '#858796';
    switch(estado.toLowerCase()) {
      case 'aceptada': return '#1cc88a'; // Verde
      case 'pendiente': return '#f6c23e'; // Amarillo
      case 'rechazada': return '#e74a3b'; // Rojo
      default: return '#858796'; // Gris
    }
  }

  descargarPDF() {
    if (!this.programadorSeleccionado) return;

    const doc = new jsPDF();
    const nombre = this.programadorSeleccionado.displayName || this.programadorSeleccionado.name;
    const email = this.programadorSeleccionado.email;

    // 1. ENCABEZADO AZUL
    doc.setFillColor(78, 115, 223); // Azul corporativo
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Reporte Administrativo", 14, 20);
    doc.setFontSize(10);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 14, 30);

    // 2. INFORMACIÓN DEL PROGRAMADOR
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Programador: ${nombre}`, 14, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Correo: ${email}`, 14, 62);
    doc.text(`Total Asesorías: ${this.totalAsesorias} | Tasa Aceptación: ${this.tasaAceptacion}%`, 14, 69);

    // ----------------------------------------------------
    // 3. TABLA DE ASESORÍAS (Lógica manual para "Sin datos")
    // ----------------------------------------------------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Detalle de Asesorías', 14, 85);

    // Preparamos los datos
    let bodyAsesorias = this.dataAsesorias.map(item => [
      item.fecha || '---',
      item.usuarioNombre || 'Anónimo',
      item.estado || '---'
    ]);

    // Si está vacío, ponemos una fila con el mensaje
    if (this.dataAsesorias.length === 0) {
      bodyAsesorias = [['---', 'No hay registros de asesorías.', '---']];
    }

    autoTable(doc, {
      startY: 90,
      headStyles: { fillColor: [78, 115, 223] }, // Azul
      head: [['Fecha', 'Usuario', 'Estado']],
      body: bodyAsesorias,
    });

    // Calcular posición para la siguiente tabla
    const finalY = (doc as any).lastAutoTable.finalY || 90;

    // ----------------------------------------------------
    // 4. TABLA DE PROYECTOS (Lógica manual para "Sin datos")
    // ----------------------------------------------------
    doc.text('Cartera de Proyectos', 14, finalY + 15);

    // Preparamos los datos
    let bodyProyectos = this.dataProyectos.map(proj => [
      proj.tipo || '---',
      proj.nombreProyecto || '---',
      'Activo'
    ]);

    // Si está vacío, ponemos una fila con el mensaje
    if (this.dataProyectos.length === 0) {
      bodyProyectos = [['---', 'No hay proyectos asignados.', '---']];
    }

    autoTable(doc, {
      startY: finalY + 20,
      headStyles: { fillColor: [28, 200, 138] }, // Verde
      head: [['Tipo', 'Nombre del Proyecto', 'Estado']],
      body: bodyProyectos,
    });

    // Guardar archivo
    doc.save(`Reporte_${nombre.replace(/\s+/g, '_')}.pdf`);
  }

 descargarExcel() {
    if(!this.programadorSeleccionado) return;

    const nombre = this.programadorSeleccionado.displayName || this.programadorSeleccionado.name;
    const wb = XLSX.utils.book_new();

    // --- HOJA 1: DATOS Y ASESORÍAS ---
    // Preparamos los datos con el encabezado personalizado
    const datosAsesorias = [
      { A: "REPORTE ADMINISTRATIVO" },
      { A: "" },
      { A: "Programador:", B: nombre },
      { A: "Correo:", B: this.programadorSeleccionado.email },
      { A: "Total Asesorías:", B: this.totalAsesorias },
      { A: "" }, // Espacio
      { A: "DETALLE DE ASESORÍAS" }, // Título de sección
      // Cabeceras de la tabla
      { A: "Fecha", B: "Usuario", C: "Estado" },
      // Mapeamos los datos
      ...this.dataAsesorias.map(item => ({
        A: item.fecha || '---',
        B: item.usuarioNombre || 'Anónimo',
        C: item.estado || '---'
      }))
    ];

    const wsAsesorias = XLSX.utils.json_to_sheet(datosAsesorias, { skipHeader: true });
    
    // Ajustar ancho de columnas para que se vea bien
    wsAsesorias['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, wsAsesorias, "Asesorías");

    // --- HOJA 2: PROYECTOS ---
    const datosProyectos = [
      { A: "CARTERA DE PROYECTOS" },
      { A: "" },
      { A: "Tipo", B: "Nombre del Proyecto", C: "Estado" },
      ...this.dataProyectos.map(proj => ({
        A: proj.tipo || '---',
        B: proj.nombreProyecto || '---',
        C: 'Activo'
      }))
    ];

    const wsProyectos = XLSX.utils.json_to_sheet(datosProyectos, { skipHeader: true });
    wsProyectos['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(wb, wsProyectos, "Proyectos");

    // Guardar archivo
    XLSX.writeFile(wb, `Reporte_${nombre.replace(/\s+/g, '_')}.xlsx`);
  }
  goToInicio() {
    this.router.navigate(['/admin1']);
  }

}
