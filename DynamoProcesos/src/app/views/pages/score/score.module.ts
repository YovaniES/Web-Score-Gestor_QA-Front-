import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScoreRoutingModule } from './score-routing.module';
// import { ModalStoreComponent } from './registro-score/modal-score/modal-score.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from "ngx-spinner";
import { CoreModule } from 'src/app/core/core.module';
import { MaterialModule } from 'src/app/material/material.module';
import { RegistroScoreComponent } from './registro-score/registro-score.component';
import { AsignarObservacionComponent } from './registro-score/modal-score/asignar-observacion/asignar-observacion.component';
import { ModalStoreComponent } from './registro-score/modal-score/modal-score.component';
import { AprobarImportarComponent } from './registro-score/modal-score/Aprobar-importar/aprobar-importar.component';
import { ObservarMasivamenteComponent } from './registro-score/modal-score/observar-masivamente/observar-masivamente.component';


@NgModule({
  declarations: [
    RegistroScoreComponent,
    ModalStoreComponent,
    AsignarObservacionComponent,
    ObservarMasivamenteComponent,
    AprobarImportarComponent
  ],
  imports: [
    CommonModule,
    ScoreRoutingModule,
    CoreModule,

    NgxPaginationModule,
    NgxSpinnerModule,
    MaterialModule
  ]
})
export class ScoreModule { }
