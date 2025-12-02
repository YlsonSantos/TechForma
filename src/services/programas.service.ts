import { Programa, Instituicao, FiltrosPrograma } from '@/types/domain'
//import { programas } from '@/data/programas'
//import { instituicoes } from '@/data/instituicoes'

interface ProgramaDTO {
  id: string;
  titulo: string;
  instituicaoId: string;
  area: string;
  modalidade: string;
  nivel: string;
  publicoAlvo: string;
  periodoInicio: string;
  periodoFim: string;
  editalUrl: string;
  cidade: string;
  estado: string;
  tags: string[];
  resumo: string;
  descricaoCompleta: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ProgramasService {
  
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não está definida no .env.local");
      throw new Error("Configuração de API ausente");
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }
  private mapProgramaToDomain(dto: ProgramaDTO): Programa {
    return {
      ...dto,
      periodoInscricao: {
        inicio: dto.periodoInicio,
        fim: dto.periodoFim
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      area: dto.area as any, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modalidade: dto.modalidade as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nivel: dto.nivel as any,
    };
  }

  async listarProgramas(filtros?: Partial<FiltrosPrograma>): Promise<Programa[]> {
    try {
      const programasDTO = await this.fetchAPI<ProgramaDTO[]>('/programas');

      let resultado = programasDTO.map(dto => this.mapProgramaToDomain(dto));

      if (filtros) {
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase();
          resultado = resultado.filter(p => 
            p.titulo.toLowerCase().includes(busca) ||
            p.resumo.toLowerCase().includes(busca) ||
            p.tags.some(tag => tag.toLowerCase().includes(busca))
          );
        }
        if (filtros.area) resultado = resultado.filter(p => p.area === filtros.area);
        if (filtros.modalidade) resultado = resultado.filter(p => p.modalidade === filtros.modalidade);
        if (filtros.nivel) resultado = resultado.filter(p => p.nivel === filtros.nivel);
      }
      
      return resultado;
    } catch (error) {
      console.error("Falha ao listar programas:", error);
      return [];
    }
  }
  
  async buscarPrograma(id: string): Promise<Programa | null> {
    try {
      const dto = await this.fetchAPI<ProgramaDTO>(`/programas/${id}`);
      return this.mapProgramaToDomain(dto);
    } catch (error) {
      console.error('Erro ao buscar programa:', error);
      return null;
    }
  }
  
  async listarInstituicoes(): Promise<Instituicao[]> {
    try {
      return await this.fetchAPI<Instituicao[]>('/instituicoes');
    } catch (error) {
      console.error("Falha ao listar instituições:", error);
      return [];
    }
  }
  
  async buscarInstituicao(id: string): Promise<Instituicao | null> {
    try {
      return await this.fetchAPI<Instituicao>(`/instituicoes/${id}`);
    } catch {
      return null;
    }
  }
}

export const programasService = new ProgramasService();