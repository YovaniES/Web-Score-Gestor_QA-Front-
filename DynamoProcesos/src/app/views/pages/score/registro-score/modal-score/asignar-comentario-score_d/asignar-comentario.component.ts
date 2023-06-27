import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignar-vacaciones',
  templateUrl: './asignar-comentario.component.html',
  styleUrls: ['./asignar-comentario.component.scss']
})
export class AsignarComentarioComponent implements OnInit {

  asigComentarioForm!: FormGroup;

  constructor(
    private scoreService: ScoreService,
    private authService: AuthService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datePipe: DatePipe,
    private dialogRef: MatDialogRef<AsignarComentarioComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE_DET: any
  ) { }

  ngOnInit(): void {
    this.newForm();
    this.getUserID();
    this.getUsername();
    this.getListEstados();
    this.cargarComentarioScore_d_ByID();
    console.log('DATA_scoreComentForm', this.DATA_SCORE_DET.scoreComentForm);
    console.log('ID_COMENTARIO', this.DATA_SCORE_DET.scoreComentForm.id_score);

    console.log('DATA', this.DATA_SCORE_DET.DATA, this.DATA_SCORE_DET.DATA.id_estado);

    console.log('DATA_SCORE_DETALLE_Y_estado', this.DATA_SCORE_DET, this.DATA_SCORE_DET.estado);
    console.log('DATA_SCORE_DET_OBS', this.DATA_SCORE_DET.observacion_solic);
    console.log('DATA_SCORE_COMENT_GEST', this.DATA_SCORE_DET.obs_registro);
  }

  newForm(){
    this.asigComentarioForm = this.fb.group({
      id_estado_d        : [''],
      tipo_documento     : [''],
      numero_documento   : [''],
      score              : [''],
      comentario_usu     : ['', [Validators.required, Validators.minLength(15)]],
    })
   }

   asignarComentarioScore_d() {
    this.spinner.show();
    const formValues = this.asigComentarioForm.getRawValue();
    console.log('O B S', this.asigComentarioForm.value, formValues);

    let parametro: any[] = [{ queryId: 12,
        mapValue: {
          p_idscored           : this.DATA_SCORE_DET.DATA.idScored,
          p_id_estado          : formValues.id_estado_d,
          p_actualiza          : this.userName,
          p_f_actualiza        : '',
          p_obs_registro       : formValues.comentario_usu  ,
          CONFIG_USER_ID       : this.userID,
          CONFIG_OUT_MSG_ERROR : '',
          CONFIG_OUT_MSG_EXITO : ''
        },
      }];
     this.scoreService.asignarComentarioScore_d(parametro[0]).subscribe({next: (resp: any) => {
        this.spinner.hide();
      console.log('COMENT_ACTUALIZADO', resp);

        this.cargarComentarioScore_d_ByID();

        this.close({resp , formValues})

          Swal.fire({
            title: 'Asignar comentario!',
            text : `Se asignó el Comentario con éxito`,
            icon : 'success',
            confirmButtonText: 'Ok'
            });

        }, error:()=>{
          Swal.fire(
            'ERROR',
            'No se pudo Comentar el registro',
            'warning'
          );
        }
     });
  }
  // id_estado:6
  cargarComentarioScore_d_ByID(){
      this.asigComentarioForm.controls['comentario_usu'  ].setValue(this.DATA_SCORE_DET.DATA.obs_registro);
      this.asigComentarioForm.controls['id_estado_d'     ].setValue(this.DATA_SCORE_DET.DATA.id_estado);
      this.asigComentarioForm.controls['tipo_documento'  ].setValue(this.DATA_SCORE_DET.DATA.tipo_documento);
      this.asigComentarioForm.controls['numero_documento'].setValue(this.DATA_SCORE_DET.DATA.numero_documento);
      this.asigComentarioForm.controls['score'           ].setValue(this.DATA_SCORE_DET.DATA.score);
       console.log('COMENTARIO_BY_ID', this.asigComentarioForm.value);
  }

  listEstados: any[] = [];
  getListEstados(){
    let parametro: any[] = [{ queryId: 5 }];

    this.scoreService.getListEstados(parametro[0]).subscribe((resp: any) => {

      // ESTADO SCORE_M SOLICITADO
      if (this.DATA_SCORE_DET.scoreComentForm.id_estado_m == 2) {
        this.listEstados = resp.list.filter((x: any) => x.idEstado == 2 || x.idEstado == 4 || x.idEstado == 5);
        console.log('COMENT_STADO_M_SOLICITADO', resp.list);
      }

      // ESTADO SCORE_M OBSERVADO
      if (this.DATA_SCORE_DET.scoreComentForm.id_estado_m == 4) {
        if (this.DATA_SCORE_DET.DATA.id_estado == 4) {
          this.listEstados = resp.list.filter((x: any) => x.idEstado == 4);
          }
      }

      // ESTADO SCORE_M APROBADO
      if (this.DATA_SCORE_DET.scoreComentForm.id_estado_m == 5) {
        this.listEstados = resp.list.filter((x: any) => x.idEstado == 4 || x.idEstado == 5);
        console.log('COMENT_STADO_M_APROBADO', resp.list);
      }

      // ESTADO SCORE_M EN VALIDACION
      if (this.DATA_SCORE_DET.scoreComentForm.id_estado_m == 3) {
        // ESTADO DETALLE EN OBSERVADO, ENVIADO
        if (this.DATA_SCORE_DET.DATA.id_estado == 4 || this.DATA_SCORE_DET.DATA.id_estado == 6 ) {
          this.listEstados = resp.list.filter((x: any) => x.idEstado == 4 || x.idEstado == 6);
        }

        // SCORE DETALLE ES APROBADO U OBSERVADO
        if (this.DATA_SCORE_DET.DATA.id_estado == 4 || this.DATA_SCORE_DET.DATA.id_estado == 5) {
          this.listEstados = resp.list.filter((x: any) => x.idEstado == 4 || x.idEstado == 5);
        }

        // SCORE DETALLE EN SOLICITADO SE PUEDE APROBAR U OBSERVAR
        if (this.DATA_SCORE_DET.DATA.id_estado == 2) {
          this.listEstados = resp.list.filter((x: any) => x.idEstado == 2 || x.idEstado == 4 || x.idEstado == 5);
        }

        // SCORE DETALLE SUBSANADO SE PUEDE OBSERVAR, APROBAR
        if (this.DATA_SCORE_DET.DATA.id_estado == 8) {
          this.listEstados = resp.list.filter((x: any) => x.idEstado == 4 || x.idEstado == 5 || x.idEstado == 8);
        }
      }

      // ESTADO SCORE_M ENVIADO El Gestor PUEDE OBSERVAR O FINALIZAR
      if (this.DATA_SCORE_DET.scoreComentForm.id_estado_m == 6) {
        this.listEstados = resp.list.filter((x: any) => x.idEstado == 4 || x.idEstado == 6);
      }
    });
  }

   userID: number = 0;
   getUserID(){
    this.authService.getCurrentUser().subscribe( resp => {
      this.userID   = resp.user.userId;
      // console.log('ID-USER', this.userID);
    })
   }

   userName: string = '';
   getUsername(){
    this.authService.getCurrentUser().subscribe( resp => {
      this.userName = resp.userName
      console.log('USER_NAME', this.userName);
    })
   }

  campoNoValido(campo: string): boolean {
    if (this.asigComentarioForm.get(campo)?.invalid && this.asigComentarioForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}


