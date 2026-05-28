import { useEffect } from 'react';
import { ETAPA_CONSULTOR_KEYS } from '../Constants/ETAPA_CONSULTOR_KEYS';
import type { WizardPayload } from '../Interfaces/i_procesos';
import { toIdArray } from '../Utils/toIdArray';

type SetFn = (key: keyof WizardPayload, value: any) => void;

export const useAutoConsultores = (d: WizardPayload, set: SetFn) => {
  const levIds = toIdArray(d.lev_consultores_ids);
  const levKey = JSON.stringify(levIds);

  useEffect(() => {
    if (levIds.length === 0) return;
    ETAPA_CONSULTOR_KEYS.forEach(key => {
      const current = toIdArray((d as any)[key]);
      if (current.length === 0) {
        set(key as keyof WizardPayload, levIds);
      }
    });
  }, [levKey]);
};