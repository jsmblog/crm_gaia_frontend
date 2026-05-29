import { useEffect, useRef } from 'react';
import { ETAPA_CONSULTOR_KEYS } from '../Constants/ETAPA_CONSULTOR_KEYS';
import type { WizardPayload } from '../Interfaces/i_procesos';
import { toIdArray } from '../Utils/toIdArray';

type SetFn = (key: keyof WizardPayload, value: any) => void;

export const useAutoConsultores = (d: WizardPayload, set: SetFn) => {
  const levIds      = toIdArray(d.lev_consultores_ids);
  const levKey      = JSON.stringify(levIds);
  const prevLevRef  = useRef<string>('[]');

  useEffect(() => {
    if (levIds.length === 0) return;

    ETAPA_CONSULTOR_KEYS.forEach(key => {
      const current    = toIdArray((d as any)[key]);
      const isEmpty    = current.length === 0;
      const wasAutoSet = JSON.stringify(current) === prevLevRef.current;

      if (isEmpty || wasAutoSet) {
        set(key as keyof WizardPayload, levIds);
      }
    });

    prevLevRef.current = levKey;
  }, [levKey]);
};