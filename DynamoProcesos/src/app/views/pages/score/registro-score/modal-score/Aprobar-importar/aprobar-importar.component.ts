import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { ScoreService } from 'src/app/core/services/score.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-correo',
  templateUrl: './aprobar-importar.component.html',
  styleUrls: ['./aprobar-importar.component.scss'],
})
export class AprobarImportarComponent implements OnInit {
  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  importForm!: FormGroup;
  activeTab: string = 'continuar';

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private scoreService: ScoreService,
    public datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private dialogRef: MatDialogRef<AprobarImportarComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) {}

  ngOnInit(): void {
    this.newFilfroForm();
  }

  newFilfroForm() {
    this.importForm = this.fb.group({
      aprobar_solicitud_m: ['', [Validators.required]],
    });
  }

  guardarPdf_y_AprobarSolicitud() {
    this.spinner.show();

    const formValues = this.importForm.getRawValue();
    console.log('O B S_IMPORT',this.importForm.value, this.DATA_SCORE.scoreObsForm.id_score);
    console.log('ID_Score_IMPORT', this.DATA_SCORE.scoreObsForm.id_score);

    let parametro: any[] = [
      {
        queryId: 28, //OJO Falta importar y guardar el pdf en la BD
        mapValue: {
          p_idScore       : this.DATA_SCORE.scoreObsForm.id_score,
          // p_idscore_materiales       : this.DATA_SCORE.scoreObsForm.id_score,
          // p_observacionScore_material: formValues.aprobar_solicitud_m,
          // CONFIG_OUT_MSG_EXITO       : '',
        },
      },
    ];
    this.scoreService.importarAprobarSolicitud(parametro[0]).subscribe({
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
