import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExportExcellIndividualService {
  constructor() {}

  exportarExcel(json: any[], excelFileName: string): Blob {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    XLSX.utils.sheet_add_json(ws, json, {
      skipHeader: false,
      origin: 'A6',
    });
    const wb: XLSX.WorkBook = {
      Sheets: { 'F2-B2C masivo': ws },
      SheetNames: ['F2-B2C masivo'],
    };

    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Llammamos al metodo - buffer anf filename
    return this.guardarArchExcel(excelBuffer, excelFileName);
  }

  guardarArchExcel(buffer: any, fileName: string): Blob {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    return data;
  }

    //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {
    //     header: [],
    //     skipHeader: false,
    //  });

  exportarExcelIndividualTDP(json: any[], excelFileName: string, scoreForm: any, scoreDetalle: any[]): any {
    console.log('ABC', json, scoreForm, scoreDetalle);

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {
      header: [],
      skipHeader: false,
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [''],
      skipHeader: false,
      origin: 'D2',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['SOLICITUD DE MODIFICACIÓN DE SCORE'],
      skipHeader: false,
      origin: 'E2',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['FECHASOLICITUD'],
      skipHeader: false,
      origin: 'B4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [scoreForm.fechaEnvioPrueba],
      skipHeader: false,
      origin: 'C4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['CÓDIGORQ'],
      skipHeader: false,
      origin: 'B5',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['RQ-008149'],
      skipHeader: false,
      origin: 'C5',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['NOMBREDEPROYECTO'],
      skipHeader: false,
      origin: 'B6',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [scoreDetalle[0].nombre_proy],
      skipHeader: false,
      origin: 'C6',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['TIPO DE PROYECTO'],
      skipHeader: false,
      origin: 'B7',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [scoreDetalle[0].tipo_proyecto],
      skipHeader: false,
      origin: 'C7',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['FECHAINICIODEPRUEBAS'],
      skipHeader: false,
      origin: 'B8',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [scoreForm.fechaIniPrueba+ ' - ' +scoreForm.fechaFinPrueba],
      skipHeader: false,
      origin: 'C8',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['RANGOHORARIODEPRUEBAS'],
      skipHeader: false,
      origin: 'B9',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [scoreForm.hora_ini_prueba +' - '+ scoreForm.hora_fin_prueba],
      skipHeader: false,
      origin: 'C9',
    });




    XLSX.utils.sheet_add_json(ws, [], {
      header: ['MOTIVO DE SOLICITUD:'],
      skipHeader: false,
      origin: 'M4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['Se requiere de la ampliación de score para preparar material para las pruebas del RQ-008136_DROP 38 - Sanity +Simple B2C.'],
      skipHeader: false,
      origin: 'N4',
    });


    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    XLSX.utils.sheet_add_json(ws, json, {
      skipHeader: false,
      origin: 'B11',
    });


    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb: XLSX.WorkBook = {
      Sheets: { 'F1-B2C unitario': ws },
      SheetNames: ['F1-B2C unitario'],
    };

    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Llammamos al metodo - buffer anf filename
    return this.guardarArchExcelInd(excelBuffer, excelFileName);
  }

  guardarArchExcelInd(buffer: any, fileName: string): Blob {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    return data;
  }




  // Export Data score_d by ID ---------------------------NOTA: FORMATO CARGA DIURNA O MASIVA---------------------------
  exportarExcelDetalleMasivo(json: any[], excelFileName: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb: XLSX.WorkBook = {
      Sheets: { 'F2-B2C masivo': ws },
      SheetNames: ['F2-B2C masivo'],
    };

    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.guardarArchExcelMasivo(excelBuffer, excelFileName);
  }

  guardarArchExcelMasivo(buffer: any, fileName: string) {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + 'Formato_Solicitud_Score_B2C_DDMMAA-MASIVA' + EXCEL_EXTENSION
    );
  }

  exportarExcelDetalleIndividual(json: any[], excelFileName: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {
      header: [],
      skipHeader: false,
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: [''],
      skipHeader: false,
      origin: 'D2',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['SOLICITUD DE MODIFICACIÓN DE SCORE'],
      skipHeader: false,
      origin: 'E2',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['FECHASOLICITUD'],
      skipHeader: false,
      origin: 'B4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['20-feb-2023'],
      skipHeader: false,
      origin: 'C4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['CÓDIGORQ'],
      skipHeader: false,
      origin: 'B5',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['RQ-008149'],
      skipHeader: false,
      origin: 'C5',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['NOMBREDEPROYECTO'],
      skipHeader: false,
      origin: 'B6',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['Validacion de financiamiento en DITO '],
      skipHeader: false,
      origin: 'C6',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['TIPO DE PROYECTO'],
      skipHeader: false,
      origin: 'B7',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['ESPECIAL'],
      skipHeader: false,
      origin: 'C7',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['FECHAINICIODEPRUEBAS'],
      skipHeader: false,
      origin: 'B8',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['08/02/2023'],
      skipHeader: false,
      origin: 'C8',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['RANGOHORARIODEPRUEBAS'],
      skipHeader: false,
      origin: 'B9',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['00:00 a 23:59'],
      skipHeader: false,
      origin: 'C9',
    });




    XLSX.utils.sheet_add_json(ws, [], {
      header: ['MOTIVO DE SOLICITUD:'],
      skipHeader: false,
      origin: 'M4',
    });

    XLSX.utils.sheet_add_json(ws, [], {
      header: ['Se requiere de la ampliación de score para preparar material para las pruebas del RQ-008136_DROP 38 - Sanity +Simple B2C.'],
      skipHeader: false,
      origin: 'N4',
    });


    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json); --------------------------------
    XLSX.utils.sheet_add_json(ws, json, {
      skipHeader: false,
      origin: 'B11',
    });

    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb: XLSX.WorkBook = {
      Sheets: { 'F1-B2C unitario': ws },
      SheetNames: ['F1-B2C unitario'],
    };

    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.guardarArchExcelIndividual(excelBuffer, excelFileName);
  }

  guardarArchExcelIndividual(buffer: any, fileName: string) {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data,fileName +'Formato_Solicitud_Score_B2C_DDMMYYYY -DIURNA'+EXCEL_EXTENSION);
  }
}
