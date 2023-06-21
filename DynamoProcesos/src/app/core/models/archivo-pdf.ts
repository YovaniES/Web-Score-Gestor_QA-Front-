export interface Evidencias{
  // id: number,
  // nombrePdf: string,
  // ProductName: string,
  // archivoPdf: string,
  // imgArchivo?: File

  id             : number,
  nombreEvidencia: string,
  imgEvidencia   : string,
  archivoPdf?    : File
}


// public int Id { get; set; }

//         [Required]
//         public string? ProductName { get; set; }
//         public string? ProductImage { get; set; }

//         [NotMapped]
//         public IFormFile? ImageFile { get; set; }
