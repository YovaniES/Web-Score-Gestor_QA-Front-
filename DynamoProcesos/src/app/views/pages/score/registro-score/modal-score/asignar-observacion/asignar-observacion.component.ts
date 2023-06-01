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
  templateUrl: './asignar-observacion.component.html',
  styleUrls: ['./asignar-observacion.component.scss']
})
export class AsignarObservacionComponent implements OnInit {

  asigObservacionForm!: FormGroup;

  constructor(
    private scoreService: ScoreService,
    private authService: AuthService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public datePipe: DatePipe,
    private dialogRef: MatDialogRef<AsignarObservacionComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE_DET: any
  ) { }

  ngOnInit(): void {
    this.newForm();
    this.getUserID();
    this.getUsername();
    this.getListEstadoDetalle();
    this.cargarObservacionByID();
    console.log('DATA_SCORE_DETALLE_OBS', this.DATA_SCORE_DET, this.DATA_SCORE_DET);
    console.log('DATA_SCORE_DET_OBS', this.DATA_SCORE_DET.observacion_solic);
    console.log('DATA_SCORE_OBS_GEST', this.DATA_SCORE_DET.obs_registro);
  }

  newForm(){
    this.asigObservacionForm = this.fb.group({
      id_estado_d        : [''],
      tipo_documento     : [''],
      numero_documento   : [''],
      score              : [''],
      observacion_usu    : ['', Validators.required],
    })
   }

  actualizarObservacion() {
    this.spinner.show();
    const formValues = this.asigObservacionForm.getRawValue();
    console.log('O B S', this.asigObservacionForm.value);

    let parametro: any[] = [{ queryId: 19,
        mapValue: {
          p_idscored               : this.DATA_SCORE_DET.idScored,
          p_id_estado              : formValues.id_estado_d,
          p_actualiza              : this.userName,
          p_f_actualiza            : '',
          p_obs_registro           : formValues.observacion_usu ,
          CONFIG_USER_ID           : this.userID,
          CONFIG_OUT_MSG_ERROR     : '',
          CONFIG_OUT_MSG_EXITO     : ''
        },
      }];
     this.scoreService.actualizarObservacion(parametro[0]).subscribe({next: (resp: any) => {
        this.spinner.hide();
      console.log('OBS_ACTUALIZADO', resp);

        this.cargarObservacionByID();
        this.close(resp)

          Swal.fire({
            title: 'Observar registro!',
            text : `Se Observó con éxito el registro`,
            icon : 'success',
            confirmButtonText: 'Ok'
            });

        }, error:()=>{
          Swal.fire(
            'ERROR',
            'No se pudo Observar el registro',
            'warning'
          );
        }
     });
  }

  cargarObservacionByID(){
      this.asigObservacionForm.controls['observacion_usu' ].setValue(this.DATA_SCORE_DET.obs_registro);
      this.asigObservacionForm.controls['id_estado_d'     ].setValue(this.DATA_SCORE_DET.id_estado);
      this.asigObservacionForm.controls['tipo_documento'  ].setValue(this.DATA_SCORE_DET.tipo_documento);
      this.asigObservacionForm.controls['numero_documento'].setValue(this.DATA_SCORE_DET.numero_documento);
      this.asigObservacionForm.controls['score'           ].setValue(this.DATA_SCORE_DET.score);
       console.log('OBSERV_BY_ID', this.asigObservacionForm.value);
  }

  listEstadoDetalle: any[] = [];
  getListEstadoDetalle(){
    let parametro: any[] = [{ queryId: 3 }];

    this.scoreService.getListEstadoDetalle(parametro[0]).subscribe((resp: any) => {
      this.listEstadoDetalle = resp.list.filter((x: any) => x.idEstado == 2 || x.idEstado == 4 || x.idEstado == 5 || x.idEstado == 7 || x.idEstado == 8 );
      console.log('ESTADOS_DETALLE', resp.list);
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
    if (this.asigObservacionForm.get(campo)?.invalid && this.asigObservacionForm.get(campo)?.touched) {
      return true;
    } else {
      return false;
    }
  }

  close(succes?: boolean) {
    this.dialogRef.close(succes);
  }
}


