export class Marcacoes {
  id?: number;
  dia: string;      // "DD/MM/YYYY"
  hora?: string;    // "HH:mm"
  evento: string;
  cor: string;      // #RRGGBB
  feito?: boolean;  // checkbox no front (persistiremos depois)

  constructor(id: number, dia: string, hora: string, evento: string, cor: string) {
    this.id = id;
    this.dia = dia;
    this.hora = hora;
    this.evento = evento;
    this.cor = cor;
  }
}