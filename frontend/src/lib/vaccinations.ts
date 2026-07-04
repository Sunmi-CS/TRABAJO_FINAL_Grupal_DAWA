import api from '@/lib/axios';
import { ApiResponse, Vaccination } from '@/types';

export interface VaccinationPayload {
  name: string;
  applicationDate: string;
  nextDueDate?: string | null;
  notes?: string;
}

// Contrato propuesto para backend:
// GET    /api/pets/:petId/vaccinations
// POST   /api/pets/:petId/vaccinations
// PUT    /api/vaccinations/:vaccinationId
// DELETE /api/vaccinations/:vaccinationId

export async function listVaccinationsByPet(petId: string): Promise<Vaccination[]> {
  const { data } = await api.get<ApiResponse<Vaccination[]>>(`/api/pets/${petId}/vaccinations`);
  return data.data;
}

export async function createVaccination(petId: string, payload: VaccinationPayload): Promise<Vaccination> {
  const { data } = await api.post<ApiResponse<Vaccination>>(`/api/pets/${petId}/vaccinations`, payload);
  return data.data;
}

export async function updateVaccination(vaccinationId: string, payload: VaccinationPayload): Promise<Vaccination> {
  const { data } = await api.put<ApiResponse<Vaccination>>(`/api/vaccinations/${vaccinationId}`, payload);
  return data.data;
}

export async function deleteVaccination(vaccinationId: string): Promise<void> {
  await api.delete(`/api/vaccinations/${vaccinationId}`);
}

export function isVaccinationApiUnavailable(error: unknown): boolean {
  const candidate = error as { response?: { status?: number; data?: { message?: string } } };
  const status = candidate.response?.status;
  const message = candidate.response?.data?.message?.toLowerCase() ?? '';

  return status === 404 || status === 405 || message.includes('ruta no encontrada');
}
