import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgxSpinnerService } from 'ngx-spinner';
import { Evidencias } from 'src/app/core/models/archivo-pdf';
import { Status } from 'src/app/core/models/status';
import { AuthService } from 'src/app/core/services/auth.service';
import { PdfImportService } from 'src/app/core/services/import-pdf.service';
import { ScoreService } from 'src/app/core/services/score.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-correo',
  templateUrl: './aprobar-importar.component.html',
  styleUrls: ['./aprobar-importar.component.scss'],
})
export class AprobarImportarComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  // loadingItem: boolean = false;
  importForm!: FormGroup;
  loadingItem: boolean = false;

  imgFile!: File;

  archivoPdf: Evidencias = {
    id: 0,
    nombreEvidencia: '',
    imgEvidencia: '',
    // archivoPdf: ,
  }
  status!: Status;

  constructor(
    public authService: AuthService,
    private pdfImportService: PdfImportService,
    private fb: FormBuilder,
    private scoreService: ScoreService,
    public datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<AprobarImportarComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) {}

  ngOnInit(): void {
    this.newFilfroForm();

    console.log('IMPORTpdf', this.DATA_SCORE.scoreObsForm);

  }

  newFilfroForm() {
    this.importForm = this.fb.group({
      id            : [0],
      nombrePdf     : ['', [Validators.required]],
      imgArchivo    : ['', [Validators.required]],
    });
  }

  guardarPdf_y_AprobarSolicitud() {
    this.spinner.show();

    const formValues = this.importForm.getRawValue();
    console.log('O B S_IMPORT',this.importForm.value, this.DATA_SCORE.scoreObsForm.id_score);
    console.log('ID_Score_IMPORT', this.DATA_SCORE.scoreObsForm.id_score);

    let parametro: any[] = [
      {
        queryId: 16, //OJO Falta importar y guardar el pdf en la BD
        mapValue: {
          p_idScore: this.DATA_SCORE.scoreObsForm.id_score,
        },
      },
    ];

    this.scoreService.aprobarOfinalizarSolicitud(parametro[0]).subscribe({
      next: (resp: any) => {
        this.spinner.hide();

        this.close(resp);

        Swal.fire({
          title: 'Importar evidencia!',
          text: `Se Importó con éxito la evidencia`,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
      error: () => {
        Swal.fire('ERROR', 'No se pudo Importar la evidencia', 'warning');
      },
    });
  }

  listEvidencias: any[] = [
    { nombre: 'Evidencia 1', archivo: 'Archivo 1', link: 'abc'},
    { nombre: 'Evidencia 2', archivo: 'Archivo 2', link: 'xyz'},
  ];

  onChange(event: any){
    // this.archivoPdf.imgArchivo = event.target.files[0];
    this.imgFile = event.target.files[0];
    console.log('EVENT', this.archivoPdf);
  }

  onPost(){
    console.log('FORM-IMPORT', this.importForm.value);

    this.status = { statusCode: 0, message:'Cargando Archivo PDF'}

    const importData: Evidencias = Object.assign(this.importForm.value);
    importData.archivoPdf = this.imgFile;
    // importData.idScore = this.DATA_SCORE.idScoreM;
    importData.nombreEvidencia = importData.nombreEvidencia;

    // LLamamos el Servicio
    this.pdfImportService.addPdf(importData).subscribe({
      next:(resp) => {
        console.log('SERV', resp);
        this. status = resp;
        if (this.status.statusCode == 1) {
          this.importForm.reset();
        }

      }, error: (err) => {
        this.status = { statusCode:0, message:'Error en el lado del Servidor'}
        console.log(err);
      }
    })
  }

  evidencias!: Evidencias[];
  getListEvidencias(){
    this.pdfImportService.getAllPdf().subscribe({
      next: (resp) => {
        console.log('LIST-EVID', resp);
        this.evidencias = resp;
      },
      error: (err) =>{
        console.log('E R R O R', err);
      }
    })
  }

  esIgualTotalEvidencia(){

  }

  descargarPdf(id: number){

  }

  // OnSubmit(nombre_pdf: any, file_pdf:any){
  //   this.pdfImportService.postFile(nombre_pdf.value, this.archivoCargado).subscribe(data => {
  //     console.log('pdf_*');
  //     nombre_pdf.value = null;
  //     file_pdf.value = null;

  //   })
  // }

  campoNoValido(campo: string): boolean {
    if (this.importForm.get(campo)?.invalid && this.importForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}
