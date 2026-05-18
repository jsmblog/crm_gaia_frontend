import { useState, useEffect, useCallback } from 'react';
import { TODAY } from '../../src/Constants/procesos';
import type { Interaccion } from '../../src/Interfaces/i_procesos';

interface InteraccionPayload {
  consultores_ids: string[];
  fecha: string;
  observaciones?: string;
  proximos_pasos?: string;
  estado_id?: string;
}

export interface InteraccionesService {
  listar:   (processId: string) => Promise<{ data: { data: Interaccion[] } }>;
  crear:    (processId: string, payload: InteraccionPayload) => Promise<unknown>;
  eliminar: (processId: string, intId: string) => Promise<unknown>;
}

interface FormState {
  consultores: string[];
  fecha: string;
  estadoId: string;
  obs: string;
  pasos: string;
}

const EMPTY_FORM: FormState = {
  consultores: [],
  fecha: TODAY,
  estadoId: '',
  obs: '',
  pasos: '',
};

export function useInteracciones(
  wizardProcessId: string | undefined,
  service: InteraccionesService,
) {
  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!wizardProcessId) { setInteracciones([]); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await service.listar(wizardProcessId);
        if (!cancelled) setInteracciones(res.data.data ?? []);
      } catch (err) {
        console.error('[useInteracciones] listar', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [wizardProcessId]); 

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setShowForm(false);
  }, []);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, val: FormState[K]) =>
      setForm(prev => ({ ...prev, [key]: val })),
    [],
  );

  const add = useCallback(async () => {
    if (!wizardProcessId || !form.fecha || saving) return;
    setSaving(true);
    try {
      await service.crear(wizardProcessId, {
        consultores_ids: form.consultores,
        fecha: form.fecha,
        observaciones: form.obs || undefined,
        proximos_pasos: form.pasos || undefined,
        estado_id: form.estadoId || undefined,
      });
      const res = await service.listar(wizardProcessId);
      setInteracciones(res.data.data ?? []);
      resetForm();
    } catch (err) {
      console.error('[useInteracciones] crear', err);
    } finally {
      setSaving(false);
    }
  }, [wizardProcessId, form, saving, service, resetForm]);

  const remove = useCallback(async (id: string) => {
    if (!wizardProcessId) return;
    try {
      await service.eliminar(wizardProcessId, id);
      setInteracciones(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('[useInteracciones] eliminar', err);
    }
  }, [wizardProcessId, service]);

  return {
    interacciones,
    loading,
    showForm,
    setShowForm,
    form,
    setField,
    saving,
    add,
    remove,
    resetForm,
  } as const;
}