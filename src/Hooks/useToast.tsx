import { useState, useCallback, useEffect, useRef } from 'react';
import '../Styles/useToast.css';
import type { Toast, ToastType } from '../Interfaces/i_toast';
import { COLORS, ICONS } from '../Constants/icons';

const DURATION = 4000;

type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

const notify = () => listeners.forEach(fn => fn([...toasts]));

export const addToast = (message: string, type: ToastType) => {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, DURATION);
};

export const useToast = () => {
  const [list, setList] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);

  const toast = {
    success: useCallback((msg: string) => addToast(msg, 'success'), []),
    error:   useCallback((msg: string) => addToast(msg, 'error'),   []),
    warning: useCallback((msg: string) => addToast(msg, 'warning'), []),
    info:    useCallback((msg: string) => addToast(msg, 'info'),    []),
  };

  return { toast, ToastContainer: () => <ToastContainer toasts={list} /> };
};

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div className="toast-container">
    {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
  </div>
);

const ToastItem = ({ toast: t }: { toast: Toast }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 300, easing: 'ease-out', fill: 'forwards' }
    );
  }, []);

  const color = COLORS[t.type];

  return (
    <div ref={ref} className="toast-item" style={{ borderLeft: `3px solid ${color}` }}>
      <span className="toast-item__icon" style={{ color }}>{ICONS[t.type]}</span>
      <span className="toast-item__message">{t.message}</span>
    </div>
  );
};