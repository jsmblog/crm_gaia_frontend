export interface MarkdownToHtml {
  (markdown: string): string;
}

export const markdownToHtml: MarkdownToHtml = (markdown: string): string => {
  let html = markdown.replace(/^---+$/gm, '<hr class="md-separator">');

  html = html.replace(/^(#{1,6})\s*(.+)$/gm, (_match: string, hashes: string, content: string): string => {
    const level: number = Math.min(hashes.length, 6);
    return `<h${level} class="co-black">${content.trim()}</h${level}>`;
  });

  html = html.replace(/```([\w]*)\n([\s\S]*?)```/g, ( code: string): string => {
    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/(\|.*\|)\n(\|:?-+:?\|)+\n((\|.*\|\n?)*)/g, (header: string, body: string): string => {
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

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>'); 
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); 
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>'); 

  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="links-ai" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="md-list">$1</ul>');

  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ol class="md-list-ordered">$1</ol>');

  html = html.replace(/\n{3,}/g, '\n\n');

  html = html.replace(/\n\n/g, '</p><p>');
  
  html = html.replace(/\n(?![<\/])/g, '<br>');

  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`;
  }

  html = html.replace(/<br>\s*(<(?:h[1-6]|table|pre|ul|ol|hr|p))/g, '$1');
  html = html.replace(/(<\/(?:h[1-6]|table|pre|ul|ol|hr|p)>)\s*<br>/g, '$1');

  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};