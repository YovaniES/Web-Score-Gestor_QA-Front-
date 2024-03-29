import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/core/services/auth.service';
import { EntidadService } from 'src/app/core/services/entidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-entidadtabla',
  templateUrl: './modal-entidadtabla.component.html',
  styleUrls: ['./modal-entidadtabla.component.scss']
})
export class ModalEntidadtablaComponent implements OnInit {

  userID: number = 0;
  entidadTablaForm!: FormGroup;

  constructor(
    private entidadService: EntidadService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalEntidadtablaComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_ENTIDAD: any
  ) { }

  ngOnInit(): void {
    this.newForm();
    this.userId();
    this.cargarTablaEntidadByID();
    this.getListIdPadreTabla();
    console.log('ID_ENT', this.DATA_ENTIDAD, this.DATA_ENTIDAD.id);

    // console.log('DATA_TABLA_E', this.DATA_ENTIDAD, this.DATA_ENTIDAD.eForm, this.DATA_ENTIDAD.eForm.entidad);
    // console.log('ABC_DATA', this.DATA_ENTIDAD.idTablaEntidad, this.DATA_ENTIDAD.eForm.entidad);
  }

  newForm(){
    this.entidadTablaForm = this.fb.group({
      nombre            : ['', Validators.required],
      descripcion       : [''],
      // id       : [''],
      entidad           : [''],
      id_correlativo    : [''],
      val_num           : [''],
      id_tabla          : [''],
    })
  }

  entidadTabla: any[]=[];
  getListIdPadreTabla(idTabla?:any){
    console.log('tabla_ent',this.DATA_ENTIDAD );

    let arrayParametro:any[] = [{
      queryId: 3,
      mapValue: {
        p_id_tabla: this.DATA_ENTIDAD.id
      }
    }];

    this.entidadService.cargarOBuscarEntidades(arrayParametro[0]).subscribe(data => {
      const arrayData:any[] = Array.of(data);

      this.entidadTabla = [];
      for (let index = 0; index < arrayData[0].list.length; index++) {
        this.entidadTabla.push({
          // id:arrayData[0].list[index].idPadre,
          nombre:arrayData[0].list[index].valor_texto_1
        });
      }
    });
  }

  agregarOactualizarTablaEntidad(){
    // if (!this.DATA_ENTIDAD) {
    //   return
    // }

    if (this.DATA_ENTIDAD.isCreation) {
      if (this.entidadTablaForm.valid) {this.agregarEntidadTabla()}
    } else {
      this.actualizarTablaEntidad();
    }
  }

  agregarEntidadTabla() {
    this.spinner.show();
    const formValues = this.entidadTablaForm.getRawValue();

    let parametro: any =  {
        queryId: 10,
        mapValue: {
          p_nombre            : formValues.nombre,
          p_descripcion       : formValues.descripcion,
          p_id_tabla          : this.DATA_ENTIDAD.eForm.entidad,
          CONFIG_USER_ID      : this.userID,
          CONFIG_OUT_MSG_ERROR: '',
          CONFIG_OUT_MSG_EXITO: ''
        },
      };

     console.log('TABLA-ENT-AGREGADO', this.entidadTablaForm.value , parametro);
    this.entidadService.agregarEntidadTabla(parametro).subscribe((resp: any) => {
      console.log('RESP-INSERT', resp);

      Swal.fire({
        title: 'Agregar Entidad!',
        text: `Entidad: ${formValues.nombre}, creado con éxito`,
        icon: 'success',
        confirmButtonText: 'Ok',
      });
      this.close(true);
    });
    this.spinner.hide();
  }

  actualizarTablaEntidad(){
    console.log('DATA_ENTIDAD*', this.DATA_ENTIDAD);

    this.spinner.show();

    const formValues = this.entidadTablaForm.getRawValue();
    let parametro: any[] = [{
        queryId: 4,
        mapValue: {
          p_id                : this.DATA_ENTIDAD.id,
          p_id_tabla          : formValues.id_tabla,
          p_id_correlativo    : formValues.id_correlativo,
          p_valor_texto_1     : formValues.nombre,
          p_descripcion       : formValues.descripcion,
          CONFIG_USER_ID      : this.userID,
          CONFIG_OUT_MSG_ERROR:'',
          CONFIG_OUT_MSG_EXITO:''
        },
      }];

    this.entidadService.actualizarTablaEntidad(parametro[0]).subscribe( {next: (resp) => {
      this.spinner.hide();

      this.cargarTablaEntidadByID();
      this.dialogRef.close('Actualizar')

      Swal.fire({
        title: 'Actualizar Entidad!',
        text : `Entidad:  ${formValues.nombre }, actualizado con éxito`,
        icon : 'success',
        confirmButtonText: 'Ok'
        })
    }, error: () => {
      Swal.fire(
        'ERROR',
        'No se pudo actualizar la entidad',
        'warning'
      );
    }});
  };

  btnAction: string = 'Agregar'
  cargarTablaEntidadByID(){
    console.log('DTA_BY_MODAL', this.DATA_ENTIDAD,);

    if (!this.DATA_ENTIDAD.isCreation) {
      this.btnAction = 'Actualizar'
        this.entidadTablaForm.controls['id_correlativo'].setValue(this.DATA_ENTIDAD.id_correlativo);
        this.entidadTablaForm.controls['nombre'        ].setValue(this.DATA_ENTIDAD.nombre);
        this.entidadTablaForm.controls['descripcion'   ].setValue(this.DATA_ENTIDAD.descripcion);
        this.entidadTablaForm.controls['id_tabla'      ].setValue(this.DATA_ENTIDAD.id_tabla)
    }
  }

  campoNoValido(campo: string): boolean {
    if ( this.entidadTablaForm.get(campo)?.invalid && this.entidadTablaForm.get(campo)?.touched ) {
      return true;
    } else {
      return false;
    }
  }

  userId() {
    this.authService.getCurrentUser().subscribe((resp) => {
      this.userID = resp.user.userId;
      // console.log('ID-USER', this.userID);
    });
  }

  close(succes?: boolean) {
    this.dialogRef.close(succes);
  }

}
