import { navigate } from './routerBridge';
import { addToast } from '../../Hooks/useToast';
import { agentBus } from './nervousSystem';
import { connection_to_backend } from '../../Connection/connection';

export type AgentAction = {
  type:    string;
  payload: Record<string, any>;
  delay?:  number;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const waitForHandler = (
  capability: string,
  timeout  = 3000,
  interval = 80,
): Promise<boolean> =>
  new Promise(resolve => {
    if (agentBus.has(capability)) return resolve(true);
    const start = Date.now();
    const poll  = setInterval(() => {
      if (agentBus.has(capability)) {
        clearInterval(poll);
        resolve(true);
      } else if (Date.now() - start >= timeout) {
        clearInterval(poll);
        console.warn(`[Dispatcher] Timeout esperando handler: "${capability}"`);
        resolve(false);
      }
    }, interval);
  });

const CORE_HANDLERS: Record<string, (p: any) => void | Promise<void>> = {

  navigate: ({ route }: { route: string }) => navigate(route),

  toast: ({ text, variant = 'info' }: { text: string; variant: string }) =>
    addToast(text, variant as 'success' | 'error' | 'warning' | 'info'),

  reload: () => window.location.reload(),

  highlight: ({ selector }: { selector: string }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ai-highlight');
    setTimeout(() => el.classList.remove('ai-highlight'), 3000);
  },

  'api:call': async ({ method = 'post', url, body = {} }: {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url:    string;
    body?:  Record<string, any>;
  }) => {
    const res = await (connection_to_backend as any)[method](url, body);
    return res.data;
  },
};

export const executeActions = async (actions: AgentAction[] = []) => {
  for (const action of actions) {
    if (action.delay) await sleep(action.delay);

    const core = CORE_HANDLERS[action.type];
    if (core) {
      try { await core(action.payload); }
      catch (e) { console.warn(`[Dispatcher] Error en "${action.type}":`, e); }
      continue;
    }

    const ready = await waitForHandler(action.type);
    if (ready) {
      try { await agentBus.emit(action.type, action.payload); }
      catch (e) { console.warn(`[Dispatcher] Error en "${action.type}":`, e); }
    } else {
      console.warn(`[Dispatcher] Acción ignorada (sin handler): "${action.type}"`);
    }
  }
  if(window.location.pathname !== '/clientes') {
    window.location.reload();
  }
};