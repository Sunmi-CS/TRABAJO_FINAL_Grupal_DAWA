'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import api from '@/lib/axios';
import { ImagePlus, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const editPetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  species: z.string().min(1, 'La especie es requerida').max(50),
  breed: z.string().max(100).optional(),
  age: z.coerce.number().int().min(0, 'La edad debe ser positiva').max(50),
  weight: z.coerce.number().min(0.1, 'El peso debe ser mayor a 0').max(500),
  notes: z.string().max(500).optional(),
  photo: z.any().optional(),
});

type PetForm = z.infer<typeof editPetSchema>;

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<PetForm>({
    resolver: zodResolver(editPetSchema),
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const { data } = await api.get(`/api/pets/${id}`);
        const pet = data.data;
        reset({
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          age: pet.age,
          weight: pet.weight,
          notes: pet.notes || '',
        });
        if (pet.photoUrl) {
          setPreviewUrl(pet.photoUrl);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos de la mascota');
      } finally {
        setIsFetching(false);
      }
    };
    if (id) {
      fetchPet();
    }
  }, [id, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        e.target.value = '';
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue('photo', e.target.files);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setValue('photo', undefined);
  };

  const onSubmit = async (data: PetForm) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('species', data.species);
      formData.append('age', data.age.toString());
      formData.append('weight', data.weight.toString());
      if (data.breed) formData.append('breed', data.breed);
      if (data.notes) formData.append('notes', data.notes);
      
      if (data.photo && data.photo.length > 0) {
        formData.append('photo', data.photo[0]);
      }

      await api.put(`/api/pets/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      router.push('/pets');
      router.refresh();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message ?? 'Error al actualizar la mascota');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Editar Mascota"
        subtitle="Actualiza la información de tu mascota"
        actions={
          <Link href="/pets" className="btn-outline bg-white">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Photo upload */}
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-dark/5 border-2 border-dashed border-dark/20 flex-shrink-0 group">
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeImage} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-dark/5 transition-colors">
                  <ImagePlus className="w-8 h-8 text-dark/40 mb-2" />
                  <span className="text-xs font-medium text-dark/60">Subir foto</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-medium text-dark mb-1">Fotografía (opcional)</h3>
              <p className="text-sm text-dark/60 mb-3">Recomendamos una imagen cuadrada donde se vea bien el rostro de tu mascota.</p>
              <p className="text-xs text-dark/40">PNG, JPG o WebP. Máx 5MB.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input id="pet-name" label="Nombre" placeholder="Ej. Firulais" error={errors.name?.message} {...register('name')} />
            <Input id="pet-species" label="Especie" placeholder="Ej. Perro, Gato, Loro" error={errors.species?.message} {...register('species')} />
            <Input id="pet-breed" label="Raza (opcional)" placeholder="Ej. Golden Retriever" error={errors.breed?.message} {...register('breed')} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="pet-age" label="Edad (años)" type="number" min="0" error={errors.age?.message} {...register('age')} />
              <Input id="pet-weight" label="Peso (kg)" type="number" step="0.1" min="0.1" error={errors.weight?.message} {...register('weight')} />
            </div>
          </div>

          <Textarea id="pet-notes" label="Observaciones (opcional)" placeholder="Alergias, comportamiento, necesidades especiales..." error={errors.notes?.message} {...register('notes')} />

          <div className="pt-4 border-t border-dark/10 flex justify-end">
            <Button type="submit" size="lg" isLoading={isLoading}>
              Actualizar Mascota
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
