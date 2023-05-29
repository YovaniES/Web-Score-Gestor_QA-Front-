import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-enviar-correo',
  templateUrl: './importar-solicitud.component.html',
  styleUrls: ['./importar-solicitud.component.scss']
})
export class ImportarSolicitudComponent implements OnInit {

  @BlockUI() blockUI!: NgBlockUI;
  loadingItem: boolean = false;
  importForm!: FormGroup;
  activeTab:string = 'continuar'

  constructor(
    private fb: FormBuilder,
    public datePipe: DatePipe,
    private dialogRef: MatDialogRef<ImportarSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public DATA_SCORE: any
  ) { }

  ngOnInit(): void {
    this.newFilfroForm();
  }

  newFilfroForm(){
    this.importForm = this.fb.group({
      importar            : [''],
    })
  }

  onTabClick(tab: string){
    this.activeTab = tab
  }

  actualizarObservacion(){

  }


  close(succes?: any) {
    this.dialogRef.close(succes);
  }
}
