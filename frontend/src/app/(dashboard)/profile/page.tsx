'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { User } from '@/types';
import Image from 'next/image';
import { User as UserIcon, Mail, Shield, CheckCircle2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: 'Debes ingresar tu contraseña actual para cambiarla',
  path: ['currentPassword']
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('La imagen no debe superar los 5MB');
        e.target.value = '';
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotoFile(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload: any = { name: data.name };
      if (data.newPassword) {
        payload.password = data.newPassword;
      }

      let updatedUser = { ...user!, name: data.name };

      // Update name and password
      const res = await api.put<{ success: boolean; data: User }>(`/api/users/${user?.id}`, payload);

      // Update avatar if selected
      if (photoFile && user?.provider === 'LOCAL') {
        const formData = new FormData();
        formData.append('avatar', photoFile);
        const avatarRes = await api.post<{ success: boolean; data: User }>(`/api/users/${user.id}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedUser = avatarRes.data.data;
      }

      updateUser(updatedUser);
      setSuccessMsg('Perfil actualizado exitosamente');
      reset({ name: data.name, currentPassword: '', newPassword: '' });
      setPhotoFile(null);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      console.error(error);
      setErrorMsg(axiosError.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
      />
      <div className="max-w-3xl grid md:grid-cols-3 gap-6">

        {/* Info lateral */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center">
            <div className={`relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-md mb-4 ${user.provider === 'LOCAL' ? 'cursor-pointer group' : ''}`}>
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              ) : user.image ? (
                <Image src={user.image} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
              )}
              {user.provider === 'LOCAL' && (
                <label className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer">
                  <span>Cambiar</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <h2 className="font-bold text-dark text-lg">{user.name}</h2>
            <p className="text-xs font-medium text-dark/50 mt-1 inline-flex items-center gap-1 bg-dark/5 px-2 py-1 rounded-md">
              {user.role === 'ADMIN' ? <Shield className="w-3 h-3 text-primary" /> : <UserIcon className="w-3 h-3 text-secondary" />}
              {user.role}
            </p>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-dark mb-4 text-sm">Información de Cuenta</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-dark/70">
                <Mail className="w-4 h-4 text-dark/40" />
                <span className="truncate">{user.email}</span>
              </li>
              <li className="flex items-center gap-3 text-dark/70">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Registrado vía {user.provider}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Formulario principal */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <h3 className="text-lg font-bold text-dark mb-2">Editar Información</h3>

            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <Input
              id="profile-name"
              label="Nombre Completo"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="profile-email"
              label="Correo Electrónico"
              value={user.email}
              disabled
              hint="El correo electrónico no se puede cambiar"
            />

            {user.provider === 'LOCAL' && (
              <>
                <div className="pt-6 mt-6 border-t border-dark/10">
                  <h3 className="text-lg font-bold text-dark mb-4">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                    <Input
                      id="profile-current-pwd"
                      type="password"
                      label="Contraseña Actual"
                      error={errors.currentPassword?.message}
                      {...register('currentPassword')}
                    />
                    <Input
                      id="profile-new-pwd"
                      type="password"
                      label="Nueva Contraseña"
                      error={errors.newPassword?.message}
                      {...register('newPassword')}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
