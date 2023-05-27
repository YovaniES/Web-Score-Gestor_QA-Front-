import { Injectable } from '@angular/core';
import { ImagePosition, Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { LOGO } from '../models/logo';

@Injectable({ providedIn: 'root' })
export class ExcellB2BService {
  private wb!: Workbook;

   dowloadExcel(dataExcel: any[]): any{
    console.log('export-data', dataExcel);
    this.wb = new Workbook();

     this.createFormato(dataExcel);
     this.createNumOpe(dataExcel);
     this.createReglas(dataExcel);
     this.createTablas(dataExcel);


    this.wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);
      fs.saveAs(blob, 'F-EXCEP-B2B-QA '+ dataExcel[0].fechaIniPrueba +  " AL "+dataExcel[0].fechaFinPrueba+'v1.xlsx')
    });
  };

  generarExcell(dataExcel: any[]): Promise<any>{
    console.log('export-data', dataExcel);
     this.wb = new Workbook();

     this.createFormato(dataExcel);
     this.createNumOpe(dataExcel);
     this.createReglas(dataExcel);
     this.createTablas(dataExcel);

     return this.wb.xlsx.writeBuffer()
  };

  private createFormato(scoreTable: any): void {
    console.log('EXPORT-B2B',scoreTable, scoreTable[0].observacion, scoreTable[0].cod_evaluacion);

    const sheet = this.wb.addWorksheet('FORMATO'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('B').width = 6;
    sheet.getColumn('C').width = 22;
    sheet.getColumn('D').width = 22;
    sheet.getColumn('E').width = 35;
    sheet.getColumn('F').width = 32;
    sheet.getColumn('G').width = 20;
    sheet.getColumn('H').width = 10;
    sheet.getColumn('I').width = 18;

    sheet.getColumn('J').width = 55;
    sheet.getColumn('K').width = 15;
    sheet.getColumn('L').width = 30;
    sheet.getColumn('M').width = 24;
    sheet.getColumn('N').width = 18;
    sheet.getColumn('O').width = 25;
    sheet.getColumn('P').width = 95;

    this.aplicarMergeTitle(sheet, [
      { value: 'FECHA DE SOLICITUD', cell: 'B4'},
      { value: 'CÓDIGO RQ', cell: 'B5'},
      { value: 'NOMBRE DE PROYECTO', cell: 'B6'},
      { value: 'FECHA INICIO DE PRUEBAS', cell: 'B7'},
      { value: 'FECHA FIN DE PRUEBAS', cell: 'B8'},

      // Data  colum D
      { value: scoreTable[0].fecha_envio, cell: 'F4'},
      { value: 'PQA-10837 ', cell: 'F5'},
      { value: 'RQ-008314', cell: 'F6'},
      { value: scoreTable[0].fecha_ini_prueba, cell: 'F7' },
      { value: scoreTable[0].fecha_ini_prueba +' a ' + scoreTable[0].fecha_fin_prueba , cell: 'F8'},
    ]);

    sheet.getRow(2).height = 82;
    sheet.getRow(4).height = 25;
    sheet.getRow(5).height = 35;
    sheet.getRow(6).height = 35;
    sheet.getRow(7).height = 35;
    sheet.getRow(8).height = 35;
    sheet.getRow(9).height = 35;

    const titulo = sheet.getCell('G2');
    titulo.value = 'SOLICITUD DE MODIFICACIÓN DE SCORE IMPLEMENTACIÓN DE PROYECTOS COMERCIALES - QA';
    titulo.style = { font: { bold: true, size: 16, },
                     alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                    //  fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}
                   };

    sheet.getCell('G2').border = {
      top   : {style:'thin'},
      left  : {style:'thin'},
      bottom: {style:'thin'},
      right : {style:'thin'},
    };

    sheet.getCell('B2').border = {
      top   : {style:'thin'},
      left  : {style:'thin'},
      bottom: {style:'thin'},
      right : {style:'thin'},
    };

    sheet.getCell('L4').border = {
      top   : {style:'thin'},
      left  : {style:'thin'},
      bottom: {style:'thin'},
      right : {style:'thin'},
    };

    sheet.getCell('O4').border = {
      top   : {style:'thin'},
      left  : {style:'thin'},
      bottom: {style:'thin'},
      right : {style:'thin'},
    };

    const textMotivo = sheet.getCell('O4');
    textMotivo.value = 'Modificar la lógica de cobro del costo de instalación B2B';
    // textMotivo.value = scoreTable[0].motivo_solicitud;  //OJO CAMBIAR A DATA DINAMICO
    textMotivo.style.font = { size: 11 };

    // Agregamos el LOGO Telefonica y lo posicionamos
    const logoId = this.wb.addImage({
      base64: LOGO,
      extension: 'png',
    });

    const posicionLogo: ImagePosition = {
      tl : { col: 4.5, row: 1.85 },
      ext: { width: 175, height: 60 },
    };

    sheet.addImage(logoId, posicionLogo);
    // sheet.addImage(logoId, 'C2:D2');

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(10);
      headerFila.values = [
        '',                                     //A
        'N°',                                   //B
        'TIPO CASO',                            //C
        'NEGOCIO Y SEGMENTO',                   //D
        'TIPO DE TRANSACCION',                  //E
        'TIPO DE VENTA (CONTADO O FINANCIADO)', //F
        'GAMA DE EQUIPO',                       //G
        'TIPO DOC',                             //H
        'RUC',                                  //I
        'NOMBRESYAPELLIDOSDELCLIENTE',          //J
        'Q de líneas',                          //K
        'SCORE',                                //L
        'CF Disponible',                        //M
        'CAP FINANCIAMIENTO',                   //N
        'CÓDIGO DE EVALUACIÓN',                 //O
        'OBSERVACIONES',                        //P
      ];

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(11, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          '',                             //A
          i + 1,                          //B
          scoreTable[i].caso_score,       //C
          scoreTable[i].segmento,         //D
          scoreTable[i].tipoTransaccion,  //E
          scoreTable[i].tipoVenta,        //F
          scoreTable[i].gama,             //G
          scoreTable[i].tipo_documento,   //H
          scoreTable[i].numero_documento, //I
          scoreTable[i].nombres_apell,    //J
          scoreTable[i].num_lin_disp,     //K
          scoreTable[i].score,            //L
          scoreTable[i].cf_disponible,    //M
          scoreTable[i].cap_financ_prev,  //N
          scoreTable[i].cod_evaluacion,   //O
          scoreTable[i].observacion       //P
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

        // Bauground fila 11 - Tabla
      sheet.getCell('B10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('C10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('D10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('E10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('F10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('G10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('H10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('I10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('J10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('K10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('L10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('M10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('N10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('O10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('P10').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};

      sheet.getCell('E2').alignment = {horizontal: 'center', vertical: 'middle'};

      sheet.getCell('B4').style = {font: {bold: true}, alignment:{vertical: 'middle'}, fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}};
      sheet.getCell('B5').style = {font: {bold: true}, alignment:{vertical: 'middle'}, fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}};
      sheet.getCell('B6').style = {font: {bold: true}, alignment:{vertical: 'middle'}, fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}};
      sheet.getCell('B7').style = {font: {bold: true}, alignment:{vertical: 'middle'}, fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}}};
      sheet.getCell('B8').style = {font: {bold: true}, alignment:{vertical: 'middle'}, fill: {type:'pattern', pattern:'solid', fgColor: {argb: 'FFFFDAB9'}}};

      sheet.getCell('L4').value = {
        'richText': [{'font': {'bold': true,'size': 11,'color': {'theme': 1},'name': 'Calibri','family': 2,'scheme': 'minor'}, 'text': 'MOTIVO DE SOLICITUD'}]
      };
      sheet.getCell('L4').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};
      sheet.getCell('G2').fill = {type:'pattern', pattern:'solid', fgColor: {argb: 'DEDEDE'}};


      headerFila.font = { bold: true, size: 11 };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 45;

     this.borderTableFormato(sheet, scoreTable);
     this.backgroundItemTabla(sheet, scoreTable);
     this.fontObservacion(sheet, scoreTable);
     this.alinearNombresYapell(sheet, scoreTable);
     this.fontPink(sheet, scoreTable)
     this.borderInfoDetalle(sheet, scoreTable)
    });
  }

  private createNumOpe(scoreTable: any): void {
    console.log('NUM OPE',scoreTable, scoreTable[0].GAMADEEQUIPO, scoreTable[0].Fecha_APP);

    const sheet = this.wb.addWorksheet('CASOS ESPECIALES'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('B').width = 18;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 20;
    sheet.getColumn('F').width = 20;
    sheet.getColumn('G').width = 20;

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },};

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        '',          //A
        'NRO OPE',   //B
        'CF',        //C
        'LINEAS',    //D
        'FINAN',     //E
        'RUC',       //F
        'Envío',     //G
      ];

      headerFila.font = { bold: true, size: 11, color: {argb: 'FF000000'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 25;

      // Border por celdas fila 2
      sheet.getCell('B1').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('C1').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('D1').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('E1').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('F1').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('G1').border = {
        bottom: {style:'thin'},
      }

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          '',                           //A
          'S62303010025365',            //B
          '2553.92',                    //C
          '140',                        //D
          '108.4',                      //E
          '20220191851',                //F
          'Envío 14.03',                //G
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }
    });
  }

  private createReglas(scoreTable: any): void {
    console.log('REGLAS',scoreTable, scoreTable[0].GAMADEEQUIPO, scoreTable[0].Fecha_APP);

    const sheet = this.wb.addWorksheet('REGLAS'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('A').width = 18;
    sheet.getColumn('B').width = 16;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 40;
    sheet.getColumn('F').width = 20;
    sheet.getColumn('G').width = 20;
    sheet.getColumn('H').width = 35;
    sheet.getColumn('I').width = 20;
    sheet.getColumn('J').width = 22;
    sheet.getColumn('K').width = 22;
    sheet.getColumn('L').width = 20;
    sheet.getColumn('M').width = 45;
    sheet.getColumn('N').width = 22;
    sheet.getColumn('O').width = 15;
    sheet.getColumn('P').width = 20;
    sheet.getColumn('Q').width = 22;
    sheet.getColumn('R').width = 18;
    sheet.getColumn('S').width = 18;

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(3);
      headerFila.values = [
        'TIPO CASO',           //A
        'SEGMENTO',            //B
        'NEGOCIO',             //C
        'CONCAT',              //D
        'NEGOCIO DET',         //E
        'TX',                  //F
        'GAMA',                //G
        'CONCAT 2',            //H
        'PRECIO EQUIPO',       //I
        'HORARIO',             //J
        'DOCUMENTO',           //K
        'CUOTA INICIAL',       //L
        '4TO DIGITO / SCORE',  //M
        'LIMITE DE CREDITO',   //N
        'CAP FINAN',           //O
        'SCORE (4DIG)',        //P
        '4TO DIG ALTA / CAEQ', //Q
        '4TO DIG PORTA',       //R
        'NRO DE LINEAS',       //S
      ];

      headerFila.font = { bold: true, size: 11, color: {argb: 'FF000000'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 25;

      // Border por celdas fila 2
      sheet.getCell('A3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('B3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('C3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('D3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('E3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('F3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('G3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('H3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('I3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('J3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('K3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('L3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('M3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('N3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('P3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('O3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('Q3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('R3').border = {
        bottom: {style:'thin'},
      }

      sheet.getCell('S3').border = {
        bottom: {style:'thin'},
      }

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(4, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          'REGULAR',                              //A
          'B2B',                                  //B
          'MOVIL',                                //C
          'FIJA B2B',                             //D
          'MOVIL, venta de CAPL, chip y contado', //E
          'CONTADO',                              //F
          'TODAS',                                //G
          'REGULAR-MOVIL B2B-CONTADO-TODAS',      //H
          '< 1500 soles',                         //I
          'Entre 1am - 5am',                      //J
          scoreTable[i].Usuario,                  //K
          'CI MINIMA 80%',                        //L
          'Financiado: 9 alta/porta Upfront: 5 alta y 4 porta', //M
          '8000',                                 //N
          '2000',                                 //O
           9,                                     //P
           7,                                     //Q
          '4',                                    //R
          50,                                     //S
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }
    //  this.borderTableForExcep(sheet, scoreTable);
    });
  }

  private createTablas(scoreTable: any): void {
    const sheet = this.wb.addWorksheet('TABLAS'); //Nombre de la Hoja

    // Establecemos el ancho y estilo de las columnas de la Tabla
    sheet.getColumn('B').width = 18;
    sheet.getColumn('C').width = 25;
    sheet.getColumn('D').width = 16;

    // DATA SCORE - TABLA DINAMICA
    sheet.columns.forEach((name_col) => {
      name_col.alignment = {vertical: 'middle', wrapText: true };
      name_col.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' },}; //Pintamos toda la hoja

      // CABECERA DE LA TABLA CON ESTILOS
      const headerFila = sheet.getRow(1);
      headerFila.values = [
        '',                   //A
        'TIPO CASO',          //B
        'NEGOCIO Y SEGMENTO', //C
        'RUCS',               //D
      ];

      headerFila.font = { bold: true, size: 11, color: {argb: 'FF000000'} };
      headerFila.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerFila.height = 16;

      // Insertamos la data en las respectivas Columnas.
      const insertarFila = sheet.getRows(2, scoreTable.length)!;
      for (let i = 0; i < insertarFila.length; i++) {
        const fila = insertarFila[i];

        fila.values = [
          '',                   //A
          'ESPECIAL',           //B
          'MOVIL B2B',          //C
          '20227891450',        //D
        ];
        fila.font = { size: 11}
        fila.alignment = { horizontal: 'center', vertical: 'middle'}
      }

    });
  }

  private aplicarMergeTitle(sheet: Worksheet, cells: { value: string; cell: string }[]){
    sheet.mergeCells('B4:E4');
    sheet.mergeCells('B5:E5');
    sheet.mergeCells('B6:E6');
    sheet.mergeCells('B7:E7');
    sheet.mergeCells('B8:E8');

    sheet.mergeCells('B2:F2'); //Logo TEL

    sheet.mergeCells('F4:G4');
    sheet.mergeCells('F5:G5');
    sheet.mergeCells('F6:G6');
    sheet.mergeCells('F7:G7');
    sheet.mergeCells('F8:G8');

    sheet.mergeCells('L4:N8'); // Motivo de solicitud
    sheet.mergeCells('O4:O8'); // Texto del Motivo solicitud
    sheet.mergeCells('G2:O2'); // Título del score

    //Border titulo de la Solicitud
    sheet.getCell('G2:O2').border = {
      top   : {style:'thin'},
      left  : {style:'thin'},
      bottom: {style:'thin'},
      right : {style:'thin'},
    }

    cells.forEach((item) => {
      const mergeSeccion = sheet.getCell(item.cell);
      mergeSeccion.value = item.value;
      mergeSeccion.style = {font: { size: 12, bold: true, },};
    });
  }

  private backgroundItemTabla(sheet: Worksheet, scoreTable: any){
    for (let i = 10; i < 10 + scoreTable.length; i++) {
      [`B${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = {fill : {type: 'pattern', pattern: 'solid', fgColor: { argb: 'DEDEDE' }},
        font: { bold: true, size: 11}, alignment: { horizontal: 'center', vertical: 'middle'}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private fontObservacion(sheet: Worksheet, scoreTable: any){
    for (let i = 10; i < 10 + scoreTable.length; i++) {
      [`P${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = {font: { bold: true, size: 11, color: {argb: 'FF3CB371'}},};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private alinearNombresYapell(sheet: Worksheet, scoreTable: any) {
    for (let i = 10; i < 10 + scoreTable.length; i++) {
      [`J${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = {alignment: { horizontal: 'left'}};
        sheet.getCell(key).border = {
            top   : {style:'thin'},
            left  : {style:'thin'},
            bottom: {style:'thin'},
            right : {style:'thin'},};
      });
    }
  }

  private fontPink(sheet: Worksheet, scoreTable: any) {
    for (let i = 10; i < 10 + scoreTable.length; i++) {
      [`C${i + 1}`,
       `D${i + 1}`,
       `E${i + 1}`,
       `F${i + 1}`,
       `G${i + 1}`,
       `H${i + 1}`,
       `I${i + 1}`,
       `J${i + 1}`,
      ].forEach((key) => {
        sheet.getCell(key).style = { alignment: { horizontal: 'center', vertical: 'middle'} ,fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' },}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private borderTableFormato(sheet: Worksheet, scoreTable: any) {
    for (let i = 9; i < 10 + scoreTable.length; i++) {
      [`B${i + 1}`,
       `C${i + 1}`,
       `D${i + 1}`,
       `E${i + 1}`,
       `F${i + 1}`,
       `G${i + 1}`,

       `H${i + 1}`,
       `I${i + 1}`,
       `J${i + 1}`,
       `K${i + 1}`,
       `L${i + 1}`,
       `M${i + 1}`,
       `N${i + 1}`,
       `O${i + 1}`,
       `P${i + 1}`,
      ].forEach((key) => {
        // sheet.getCell(key).style = { alignment: { horizontal: 'center', vertical: 'middle'} ,fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' },}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

  private borderInfoDetalle(sheet: Worksheet, scoreTable: any) {
    for (let i = 3; i < 8; i++) {
      [`B${i + 1}`,
       `C${i + 1}`,
       `D${i + 1}`,
       `E${i + 1}`,
       `F${i + 1}`,
       `G${i + 1}`,
      ].forEach((key) => {
        // sheet.getCell(key).style = { alignment: { horizontal: 'center', vertical: 'middle'} ,fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB0C4DE' },}};
        sheet.getCell(key).border = {
          top   : {style:'thin'},
          left  : {style:'thin'},
          bottom: {style:'thin'},
          right : {style:'thin'},
        }
      });
    }
  }

}

// Color: FF4169E1= celeste
