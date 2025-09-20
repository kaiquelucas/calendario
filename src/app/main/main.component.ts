import { Component, OnInit } from '@angular/core';
import { Marcacoes } from '../Model/marcacoes';
import { MarcacoesService } from '../services/marcacoes.service';
import { HolidayService } from '../services/holiday.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  today = new Date();

  daysInMonth: number[] = [];
  monthName = '';

  diaSelecionado: number | null = null;
  hora = '';
  evento = '';
  cor = '#007bff'; // azul padrão

  marcacoes: Marcacoes[] = [];
  feriados: string[] = [];

  constructor(
    private marcacoesService: MarcacoesService,
    private holidayService: HolidayService
  ) { }

  ngOnInit(): void {
    this.atualizarCalendario();
    this.carregarMarcacoes();
    this.holidayService.getHolidaysWithFallback(this.currentYear).subscribe({
      next: (dates) => {
        this.feriados = dates;
      },
      error: (err) => {
        console.warn('Falha ao carregar feriados, usando fallback local:', err);
        this.feriados = this.holidayService.getPortugalStaticForYear(this.currentYear);
      }
    });
  }

  atualizarCalendario(): void {
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);
    this.monthName = new Date(this.currentYear, this.currentMonth)
      .toLocaleString('pt-PT', { month: 'long', year: 'numeric' });
  }

  mudarMes(offset: number): void {
    this.currentMonth += offset;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.atualizarCalendario();

    // recarrega feriados ao trocar de ano
    this.holidayService.getHolidaysWithFallback(this.currentYear).subscribe({
      next: (dates) => { this.feriados = dates; },
      error: (err) => {
        console.warn('Falha ao carregar feriados do novo ano:', err);
        this.feriados = this.holidayService.getPortugalStaticForYear(this.currentYear);
      }
    });
  }

  clicarDia(day: number): void {
    const hoje = new Date();
    if (this.currentMonth !== hoje.getMonth() || this.currentYear !== hoje.getFullYear()) {
      alert('Só pode adicionar marcações no mês atual!');
      return;
    }
    this.diaSelecionado = day;
    this.hora = '';
    this.evento = '';
    this.cor = '#007bff';
  }

  fecharPopup(): void {
    this.diaSelecionado = null;
  }

  // Helpers de data: normaliza vários formatos para { y, m, d }
  private parseToYMD(valor: unknown): { y: number; m: number; d: number } | null {
    if (!valor) return null;

    if (valor instanceof Date && !isNaN(valor.getTime())) {
      return { y: valor.getFullYear(), m: valor.getMonth() + 1, d: valor.getDate() };
    }

    if (typeof valor === 'string') {
      const s = valor.trim();

      // ISO: 2025-09-20 ou 2025-09-20T14:00:00Z
      const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) {
        const y = +iso[1], m = +iso[2], d = +iso[3];
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d };
      }

      // BR: DD/MM/YYYY ou D/M/YYYY
      const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (br) {
        const d = +br[1], m = +br[2], y = +br[3];
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d };
      }

      // Fallback
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
      }
    }
    return null;
  }

  private ymdKey(y: number, m: number, d: number): string {
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  private dayKeyFromNumber(day: number): string {
    return this.ymdKey(this.currentYear, this.currentMonth + 1, day);
  }

  private diaStrBR(day: number): string {
    return `${String(day).padStart(2, '0')}/${String(this.currentMonth + 1).padStart(2, '0')}/${this.currentYear}`;
  }

  // Filtra marcações por dia
  getMarcacoesDoDia(day: number): Marcacoes[] {
    const targetKey = this.dayKeyFromNumber(day);
    return this.marcacoes.filter(m => {
      const ymd = this.parseToYMD(m.dia);
      return !!ymd && this.ymdKey(ymd.y, ymd.m, ymd.d) === targetKey;
    });
  }

  // Cor da bolinha (primeira pendente ou primeira geral)
  getDotColor(day: number): string | null {
  const itens = this.getMarcacoesDoDia(day);
  if (!itens.length) return null;
  const pendente = itens.find(i => !i.feito);
  return (pendente?.cor || itens[0].cor) ?? null;
}

  // Verifica feriado via lista ISO (YYYY-MM-DD)
  ehFeriado(day: number): boolean {
    const isoKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.feriados.includes(isoKey);
  }

  // Cria marcação para o dia selecionado
  salvarMarcacao(): void {
    if (this.diaSelecionado === null || !this.evento) return;

    const payload: Marcacoes = {
      dia: this.diaStrBR(this.diaSelecionado!),
      hora: this.hora,
      evento: this.evento,
      cor: this.cor, // cor escolhida no popup
      feito: false
    };

    this.marcacoesService.criarMarcacao(payload).subscribe({
      next: (res) => {
        const ymd = this.parseToYMD(res.dia) ?? this.parseToYMD(payload.dia);
        const dd = String(ymd!.d).padStart(2, '0');
        const mm = String(ymd!.m).padStart(2, '0');
        const brDate = `${dd}/${mm}/${ymd!.y}`;
        const cor = res.cor || payload.cor;   // usa a cor retornada ou, se não tiver, a cor escolhida
        this.marcacoes.push({ ...res, dia: brDate, cor });
        this.hora = '';
        this.evento = '';
      },
      error: () => {
        this.marcacoes.push({ ...payload, id: Math.floor(Math.random() * 1e9) });
      }
    });
  }

  // Marca como feito/pendente (checkbox)
  alternarFeito(m: Marcacoes): void {
    m.feito = !m.feito;
    // depois: PUT no backend se necessário
  }

  // Exclui marcação
  deletarMarcacao(m: Marcacoes, _indexNaListaDoDia: number): void {
    const idxGlobal = this.marcacoes.indexOf(m);
    if (idxGlobal < 0) return;

    if (m.id == null) {
      this.marcacoes.splice(idxGlobal, 1);
      return;
    }

    this.marcacoesService.deletarMarcacoes(m.id).subscribe({
      next: () => this.marcacoes.splice(idxGlobal, 1),
      error: (err) => console.error('Erro ao deletar:', err)
    });
  }

  // Carrega marcações do backend
  carregarMarcacoes(): void {
  this.marcacoesService.getMinhasMarcacoes().subscribe({
    next: (data) => {
      this.marcacoes = (data ?? []).map(m => {
        const ymd = this.parseToYMD(m.dia);
        const dd = ymd ? String(ymd.d).padStart(2,'0') : '';
        const mm = ymd ? String(ymd.m).padStart(2,'0') : '';
        const yyyy = ymd ? String(ymd.y) : '';

        // aceita 'cor' ou 'Cor' vindas do backend
        const cor = (m as any).cor ?? (m as any).Cor ?? null;

        return {
          ...m,
          dia: ymd ? `${dd}/${mm}/${yyyy}` : m.dia,
          cor   // <- não aplique '#007bff' aqui
        };
      });

      // Recupera cores do localStorage se o backend não enviou
      this.marcacoes.forEach(m => {
        if (!m.cor && m.id != null) {
          const saved = localStorage.getItem('marcacaoColor:' + m.id);
          if (saved) m.cor = saved;
        }
      });
    },
    error: (err) => {
      console.warn('Falha ao carregar marcações:', err);
      this.marcacoes = [];
    }
  });
}
}