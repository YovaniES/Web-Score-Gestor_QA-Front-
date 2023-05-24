import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ExportExcellIndividualService } from 'src/app/core/services/export-excell.service';
import { ScoreService } from 'src/app/core/services/score.service';
import { SendMailService } from 'src/app/core/services/send-mail.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-correo',
  templateUrl: './enviar-correo.component.html',
  styleUrls: ['./enviar-correo.component.scss']
})
export class EnviarCorreoComponent implements OnInit {

  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  mailForm!: FormGroup;

  constructor(
    private sendMailService: SendMailService,
    private fb: FormBuilder,
    private scoreService: ScoreService,
    private exportExcellIndividualService: ExportExcellIndividualService,
    public datePipe: DatePipe,
    private dialogRef: MatDialogRef<EnviarCorreoComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) { }

  ngOnInit(): void {
    this.newFilfroForm();

    if (this.DATA_SCORE && this.DATA_SCORE.scoreMailForm.id_score ) {
      console.log('SCORE-M A I L2', this.DATA_SCORE.scoreMailForm);
      console.log('ID-SCOREMAIL', this.DATA_SCORE.scoreMailForm.id_score);
      console.log('FORMATO-ENVIO', this.DATA_SCORE.scoreMailForm.formato_envio );
      console.log('FECHA_INI', this.DATA_SCORE.scoreMailForm.fecha_ini_prueba);
      console.log('FECHA_INIX', this.DATA_SCORE.scoreMailForm.fecha_ini_prueba);
    }
  }

  newFilfroForm(){
    this.mailForm = this.fb.group({
      destinatario    : ['', Validators.required],
      copia           : ['', Validators.required],
      mensaje         : ['', Validators.required],

      fechaIniPrueba  : [null],
      fechaFinPrueba  : [null],
      fechaEnvioPrueba: [null]
    })
  }

  // dowload(): void {
  //   this.
  // }


  enviarDataTDP(){
 if (this.DATA_SCORE.scoreMailForm.formato_envio  == 2) {
        this.exportScoreDetalleMasivo(this.DATA_SCORE.scoreMailForm.idScoreM);
      }else{
        this.exportScoreDetalleIndividual(this.DATA_SCORE.scoreMailForm.id_score);
      }

    // Swal.fire({
    //   title: 'Enviar Registro score?',
    //   text: `¿Estas seguro que desea enviar el registro y cambiar el estado a enviado? `,
    //   icon: 'question',
    //   confirmButtonColor: '#20c997',
    //   cancelButtonColor : '#9da7b1',
    //   confirmButtonText : 'Si, Enviar!',
    //   showCancelButton  : true,
    //   cancelButtonText  : 'Cancelar',
    // }).then((resp) => {
    //   if (resp.value && this.DATA_SCORE.scoreMailForm.formato_envio  == 2) {
    //     this.exportScoreDetalleMasivo(this.DATA_SCORE.scoreMailForm.idScoreM);
    //   }else{
    //     this.exportScoreDetalleIndividual(this.DATA_SCORE.scoreMailForm.id_score);
    //   }
    // });
  }

  listDetalleScore: any
  exportScoreDetalleMasivo(id_score: number){

  }

  exportScoreDetalleIndividual(id_score: number){
    let parametro: any[] = [{
      "queryId": 27,
      "mapValue": {
          p_idScore : id_score,
      }
    }];
    this.scoreService.exportScoreDetalleIndividual(parametro[0]).subscribe((resp: any) => {
      const file: Blob = this.exportExcellIndividualService.exportarExcelIndividualTDP(resp.list, 'Indiv', this.DATA_SCORE.scoreMailForm, this.listDetalleScore );

      this.enviarCorreo(file)
    })
  }

  // fechaIniPrueba: any = ''
  // fechaFinPrueba: any = ''
  // enviarCorreo(file: Blob){
    enviarCorreo(file: Blob){
    this.blockUI.start("Enviando Data al correo del TDP") ;

    const data = new FormData();

    const fechaIniPrueba = this.DATA_SCORE.scoreMailForm.fechaIniPrueba
    const fechaFinPrueba = this.DATA_SCORE.scoreMailForm.fechaFinPrueba

    data.append("From","procesosqa@indratools.net");
    data.append("ToEmail", this.mailForm.controls['destinatario'].value);
    data.append("Cc", this.mailForm.controls['copia'].value);
    data.append("Subject","Formato_Solicitud_Score_B2C_"+ fechaIniPrueba +  " AL "+ fechaFinPrueba+" -DIURNA");
    data.append("Body", this.mailForm.controls['mensaje'].value);
    data.append("Attachments", file, "Formato_Solicitud_Score_B2C_"+ fechaIniPrueba +  " AL "+ fechaFinPrueba+" -DIURNA" + '.xlsx');

    this.sendMailService.SendDataByEmail(data).then(resp => {
      if (resp && resp.ok) {
        Swal.fire({
          title: 'Enviar mensaje!',
          text : `El mensaje fue enviado con éxito`,
          icon : 'success',
          confirmButtonText: 'Ok',
        });
        // this.cambiarEstadoScoreM('ENVIADO');
        // this.cambiarEstadoDetalleAenviado();
        this.close(true)
      }
      this.blockUI.stop();
    }).catch((error) => console.log('ERROR',error));
  }


  cambiarEstadoDetalleAenviado(){
    let parametro: any[] = [{ queryId: 22,
      mapValue: {
        p_idScore: this.DATA_SCORE.idScoreM,
      },
    }];

   this.scoreService.actualizarScoreD(parametro[0]).subscribe( {next: (resp: any) => {
     }});
   };

   listEstado: any[] = [];
   getListEstado(){
     let parametro: any[] = [{ queryId: 3 }];

     this.scoreService.getListEstado(parametro[0]).subscribe((resp: any) => {
       this.listEstado = resp.list;
       // console.log('ESTADOS', resp.list);
     });
   }

   buscarEstadoPorNombre(nombreEstado:string): any{
    return this.listEstado.find(estado => estado.cNombre.toUpperCase() == nombreEstado);
  }

   cambiarEstadoScoreM(nombreEstado: string){
    console.log('SSS',this.DATA_SCORE,  this.DATA_SCORE.estado );

    // console.log('Estados_M',this.listEstado)
    const estado = this.buscarEstadoPorNombre(nombreEstado);

    // this.actualizarScore(estado.idEstado); // NOTA: Falta validar desde el modal
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}
