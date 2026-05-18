export const PROVIDERS = {
    deepseek: {
        label: 'Deepseek',
        avatar: '◉',
        avatarColor: '#2563EB',
        models: [
            { id: 'deepseek-v4-flash',     label: 'Flash',      desc: 'Conversacional' },
            { id: 'deepseek-v4-pro', label: 'Pro',  desc: 'Razonamiento profundo' },
        ],
    },
} as const;
