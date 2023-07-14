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
  importForm!: FormGroup;
  imgFile!: File;
  status!: Status;
  // imgBaseUrl = API_IMPORT_PDF_SCORE + '/resources/';
  imgBaseUrl= 'https://localhost:7174/resources/'

  loadingItem: boolean = false;

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
    this.getAllEvidencias();

    console.log('IMPORTpdf', this.DATA_SCORE.scoreObsForm);
    console.log('IdScore_IMPORT', this.DATA_SCORE.scoreObsForm.id_score);
  }

  newFilfroForm() {
    this.importForm = this.fb.group({
      id         : [''],
      idScore_m  : [''],
      nombre     : [''],
      // nombre     : ['', [Validators.required, Validators.minLength(10)]],
      archivo    : ['', [Validators.required]],
    });
  }

  idScoreM: any = 0;
  listEvidencias:Evidencias[] = [];
  getAllEvidencias(){
    this.idScoreM  = this.DATA_SCORE.scoreObsForm.id_score;

    // console.log('ID_SCORE_IMP', this.idScoreM);
    this.pdfImportService.getAllPdf().subscribe({
      next: (resp) => {
        //  this.listEvidencias = resp;
        console.log('GETALL', resp, );
         this.listEvidencias = resp.filter(x => x.idScore_m == this.DATA_SCORE.scoreObsForm.id_score);

         console.log('GET_BY_IDSCORE', resp.filter(x => x.idScore_m == this.DATA_SCORE.scoreObsForm.id_score ), );
        },
      error: (err)=> { console.log(err);
      }
    })
  }

  descargarPdf(id: any){
    console.log('ID-IMPORT', id);

    this.pdfImportService.descargarPdf(id).subscribe({
      next: (resp) => {

      },
      error : (err) => { console.log(err);
      }
    })

  }

  aprobarSolicitud() {
    console.log('ID_Score_IMPORT', this.DATA_SCORE.scoreObsForm.id_score);

    Swal.fire({
      title: 'Aprobar solicitud?',
      text: `¿Estas seguro que desea Aprobar la Solicitud, tenga en cuenta que ya no podrá importar más evidencias? `,
      icon: 'question',
      confirmButtonColor: '#08b1c1',
      cancelButtonColor: '#9da7b1',
      confirmButtonText: 'Si, Aprobar!',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((resp) => {
      if (resp.value) {
        this.spinner.show();

        let parametro: any[] = [
          {
            queryId: 16,
            mapValue: { p_idScore: this.DATA_SCORE.scoreObsForm.id_score },
          },
        ];
        this.scoreService.aprobarSolicitud(parametro[0]).subscribe({
          next: (resp: any) => {
            this.spinner.hide();
            this.close(resp);
          },
          error: () => {
            Swal.fire('ERROR', 'No se pudo Aprobar la Solicitud', 'warning');
          },
        });
      }
    });
  }


  onChange(event: any){
    // this.archivoPdf.archivo = event.target.files[0];
    this.imgFile = event.target.files[0];
  }

  guardarEvidencia(){
    this.spinner.show();
    console.log('FORM-IMPORT', this.importForm.value);

    this.status = { statusCode: 0, message:'Cargando Archivo PDF'}

    const frmData: Evidencias = Object.assign(this.importForm.value);

    frmData.archivo = this.imgFile;
    frmData.idScore_m = this.idScoreM;

    // LLamamos el Servicio
    this.pdfImportService.addPdf(frmData).subscribe({
      next:(resp) => {
        console.log('SERV-ADD', resp);
        this.status = resp;

        if (this.status.statusCode == 1) {
          this.importForm.reset();
        }

        this.spinner.hide(); //Cerramos el spinner

        Swal.fire({
          title: 'Agregar Evidencia!',
          text: `Se guardó con éxito la evidencia`,
          icon: 'success',
          confirmButtonText: 'Ok',
        });

        this.getAllEvidencias();

      }, error: (err) => {
        this.status = { statusCode:0, message:'Error en el lado del Servidor'}
        console.log(err);
      }
    })
  }

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
