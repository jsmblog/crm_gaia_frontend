export interface MarkdownToHtml {
  (markdown: string): string;
}

export const markdownToHtml: MarkdownToHtml = (markdown: string): string => {
  // Primero, convertir los separadores markdown (---) a <hr>
  let html = markdown.replace(/^---+$/gm, '<hr class="md-separator">');

  // Convertir encabezados (debe ir antes de otros reemplazos)
  html = html.replace(/^(#{1,6})\s*(.+)$/gm, (match: string, hashes: string, content: string): string => {
    const level: number = Math.min(hashes.length, 6);
    return `<h${level} class="co-black">${content.trim()}</h${level}>`;
  });

  // Convertir bloques de código (antes que código inline)
  html = html.replace(/```([\w]*)\n([\s\S]*?)```/g, (match: string, lang: string, code: string): string => {
    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });

  // Convertir tablas markdown
  html = html.replace(/(\|.*\|)\n(\|:?-+:?\|)+\n((\|.*\|\n?)*)/g, (match: string, header: string, separator: string, body: string): string => {
    const headerCells = header
      .split('|')
      .filter((cell: string) => cell.trim() !== '')
      .map((cell: string) => `<th>${cell.trim()}</th>`)
      .join('');

    const bodyRows = body
      .split('\n')
      .filter((row: string) => row.trim() !== '')
      .map((row: string) => {
        const cells = row
          .split('|')
          .filter((cell: string) => cell.trim() !== '')
          .map((cell: string) => `<td>${cell.trim()}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `<table class="md-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  // Convertir negritas y cursivas
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>'); // Negrita + cursiva
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Negrita
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>'); // Cursiva

  // Convertir código inline
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Convertir enlaces
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="links-ai" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convertir listas desordenadas
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="md-list">$1</ul>');

  // Convertir listas ordenadas
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ol class="md-list-ordered">$1</ol>');

  // Limpiar saltos de línea excesivos (más de 2 seguidos)
  html = html.replace(/\n{3,}/g, '\n\n');

  // Convertir dobles saltos de línea a párrafos
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Convertir saltos de línea simples a <br> solo si no están entre tags HTML
  html = html.replace(/\n(?![<\/])/g, '<br>');

  // Envolver en párrafos si no empieza con un tag
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  // Limpiar <br> antes y después de elementos de bloque
  html = html.replace(/<br>\s*(<(?:h[1-6]|table|pre|ul|ol|hr|p))/g, '$1');
  html = html.replace(/(<\/(?:h[1-6]|table|pre|ul|ol|hr|p)>)\s*<br>/g, '$1');

  // Limpiar párrafos vacíos
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};