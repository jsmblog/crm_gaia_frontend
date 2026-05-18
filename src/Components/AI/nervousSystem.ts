    type AgentHandler = (payload: Record<string, any>) => Promise<void> | void;

    const _handlers = new Map<string, AgentHandler>();

    export const agentBus = {
    register(capability: string, handler: AgentHandler): () => void {
        _handlers.set(capability, handler);
        return () => _handlers.delete(capability);
    },
    async emit(capability: string, payload: Record<string, any> = {}): Promise<void> {
        const h = _handlers.get(capability);
        if (h) await h(payload);
        else console.warn(`[AgentBus] Sin handler para: "${capability}"`);
    },
    has: (cap: string) => _handlers.has(cap),
    };