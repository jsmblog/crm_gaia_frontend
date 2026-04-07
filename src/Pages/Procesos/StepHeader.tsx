import { Check } from 'lucide-react';
import { STEPS } from '../../Constants/procesos';

interface Props {
  current: number;
  savedSteps: Set<number>;
  processCreated: boolean;
}

export const StepHeader = ({ current, savedSteps, processCreated }: Props) => (
  <div className="stepper">
    {STEPS.map((label, i) => {
      const idx = i + 1;
      const done = savedSteps.has(idx);
      const active = idx === current;
      const locked = idx > 1 && !processCreated;

      return (
        <div key={label} className="stepper__item">
          {i > 0 && (
            <div className={`stepper__line ${done || savedSteps.has(idx - 1) ? 'stepper__line--done' : ''}`} />
          )}
          <div className={[
            'stepper__dot',
            done ? 'stepper__dot--done' : '',
            active ? 'stepper__dot--active' : '',
            locked ? 'stepper__dot--locked' : '',
          ].filter(Boolean).join(' ')}>
            {done ? <Check size={13} /> : idx}
          </div>
          <span className={`stepper__label ${active ? 'stepper__label--active' : ''}`}>
            {label}
            {done && !active && <span className="stepper__label-ok"> ✓</span>}
          </span>
        </div>
      );
    })}
  </div>
);
