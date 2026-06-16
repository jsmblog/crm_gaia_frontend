import { IMAGE_EXTENSIONS } from "./allowed_extension";

export const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });


export const isImage = (name: string) => {
    const ext = `.${name.split('.').pop()?.toLowerCase()}`;
    return IMAGE_EXTENSIONS.includes(ext);
};

export const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx') return '📝';
    if (ext === 'xlsx') return '📊';
    if (IMAGE_EXTENSIONS.includes(`.${ext}`)) return '🖼️';
    return '📎';
};

export const EJEMPLOS = [
    '¿Cuántos procesos están en ejecución este mes?',
    '¿Qué proyectos tiene el cliente con más actividad?',
    '¿Cuáles son los procesos aprobados en los últimos 30 días?',
    '¿Cuántos consultores están activos actualmente?',
];

export const TYPING_SPEED = 5;



