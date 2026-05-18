import { Check, Loader, Lock } from 'lucide-react';

interface SaveRowProps {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
  labels?: {
    saving?: string;
    saved?: string;
    idle?: string;
  };
  icon?: React.ReactNode;
  hint?: string;
}

export const StepSaveRow = ({
  onSave,
  saving,
  saved,
  disabled = false,
  labels = {},
  icon,
  hint,
}: SaveRowProps) => {
  const { saving: savingLabel = 'Guardando…', saved: savedLabel = 'Guardado', idle: idleLabel = 'Guardar' } = labels;
  const defaultIcon = <Check size={14} />;

  return (
    <div className="step-save-row">
      <button className="step-save-btn" onClick={onSave} disabled={saving || disabled}>
        {saving ? (
          <><Loader size={14} className="spin" /> {savingLabel}</>
        ) : (
          <>{icon ?? defaultIcon} {saved ? savedLabel : idleLabel}</>
        )}
      </button>
      {saved && (
        <span className="step-save-hint">
          {hint ?? '✓ Guardado — puedes continuar'}
        </span>
      )}
    </div>
  );
};

interface LockedProps {
  message?: string;
  variant?: 'overlay' | 'inline';
}

export const StepLockedBanner = ({
  message = 'Guarda el paso 1 primero para habilitar esta etapa.',
  variant = 'inline',
}: LockedProps) => {
  if (variant === 'overlay') {
    return (
      <div className="step-body step-locked">
        <Lock size={32} strokeWidth={1.2} />
        <p dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    );
  }
  return <div className="step-locked">{message}</div>;
};