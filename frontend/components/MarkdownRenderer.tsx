'use client';

import React, { useMemo, createContext, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface ColumnMeta {
  colIdx: number;
  headerText: string;
  role: 'identifier' | 'metric' | 'prose' | 'standard';
  maxCellLength: number;
  avgCellLength: number;
  hasBullets: boolean;
}

const TableMetaContext = createContext<{
  columns: ColumnMeta[];
}>({
  columns: [],
});

/**
 * Extracts plain text from a HAST AST node recursively.
 */
function extractTextFromHast(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromHast).join('');
  }
  return '';
}

/**
 * Automatically inspects the table HAST node to classify each column into:
 * - 'identifier': First column (Bank, Ticker, Metric Name, etc.)
 * - 'metric': Compact columns with short numbers/stats, preventing bloated column widths
 * - 'prose': Columns with bullet points, long paragraphs, or multi-line narrative
 * - 'standard': Moderate text content
 */
function analyzeTableColumns(tableNode: any): ColumnMeta[] {
  if (!tableNode || !tableNode.children) return [];

  const thead = tableNode.children.find((c: any) => c.tagName === 'thead');
  const tbody = tableNode.children.find((c: any) => c.tagName === 'tbody');

  const theadTr = thead?.children?.find((c: any) => c.tagName === 'tr');
  const thNodes = theadTr?.children?.filter((c: any) => c.tagName === 'th') || [];
  const tbodyTrs = tbody?.children?.filter((c: any) => c.tagName === 'tr') || [];

  return thNodes.map((th: any, colIdx: number) => {
    const headerText = extractTextFromHast(th).trim();

    const cellTexts = tbodyTrs.map((tr: any) => {
      const tds = tr.children?.filter((c: any) => c.tagName === 'td') || [];
      return extractTextFromHast(tds[colIdx] || '').trim();
    });

    const maxCellLength = Math.max(0, ...cellTexts.map((t: string) => t.length));
    const avgCellLength = cellTexts.length > 0
      ? cellTexts.reduce((acc: number, t: string) => acc + t.length, 0) / cellTexts.length
      : 0;

    const hasBullets = cellTexts.some((t: string) =>
      t.includes('•') || t.includes('- ') || t.includes('* ') || t.includes('\n') || t.toLowerCase().includes('<br')
    );

    let role: ColumnMeta['role'] = 'standard';
    if (colIdx === 0) {
      role = 'identifier';
    } else if (hasBullets || maxCellLength > 50 || avgCellLength > 40) {
      role = 'prose';
    } else if (maxCellLength <= 35 && !hasBullets) {
      role = 'metric';
    }

    return {
      colIdx,
      headerText,
      role,
      maxCellLength,
      avgCellLength,
      hasBullets,
    };
  });
}

/**
 * Parses header strings to separate main metric/column title from parenthetical subtitles or units.
 * E.g., "Rasio Kredit Bermasalah (Kredit macet > 90 hari)" -> Title: "Rasio Kredit Bermasalah", Subtitle: "(Kredit macet > 90 hari)"
 * E.g., "NPL (Q4 2023)<br>(% dari total kredit)" -> Title: "NPL (Q4 2023)", Subtitle: "(% dari total kredit)"
 */
function parseHeaderSubtitles(text: string): { title: string; subtitle?: string } {
  if (/<br\s*\/?>/i.test(text)) {
    const parts = text.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return {
        title: parts[0],
        subtitle: parts.slice(1).join(' '),
      };
    }
  }

  const parenMatch = text.match(/^(.*?)\s*(\([^(]+\))$/);
  if (parenMatch && parenMatch[1].trim().length > 0) {
    return {
      title: parenMatch[1].trim(),
      subtitle: parenMatch[2].trim(),
    };
  }

  return { title: text };
}

/**
 * Formats header content so that main labels stand out while secondary timeframes/notes
 * are displayed as clean, readable muted subtext rather than screaming all-caps unbroken text.
 */
function renderSmartHeaderContent(children: React.ReactNode, role: ColumnMeta['role']): React.ReactNode {
  let text = '';
  if (typeof children === 'string') {
    text = children;
  } else if (React.isValidElement(children) && typeof (children.props as any)?.children === 'string') {
    text = (children.props as any).children;
  }

  if (text) {
    const { title, subtitle } = parseHeaderSubtitles(text);
    if (subtitle) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-100 tracking-wider uppercase leading-snug">
            {title}
          </span>
          <span className="text-[10px] text-slate-400 font-normal normal-case tracking-normal leading-tight">
            {subtitle}
          </span>
        </div>
      );
    }
  }

  return renderWithHtmlBreaks(children);
}

/**
 * Recursively parses and converts raw `<br>` or `<br/>` HTML tags embedded
 * inside markdown text nodes into actual React <br /> elements.
 */
function renderWithHtmlBreaks(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    if (!/<br\s*\/?>/i.test(children)) {
      return children;
    }
    const parts = children.split(/(<br\s*\/?>)/gi);
    return parts.map((part, index) => {
      if (/<br\s*\/?>/i.test(part)) {
        return <br key={index} className="my-1" />;
      }
      return part;
    });
  }

  if (Array.isArray(children)) {
    return React.Children.map(children, (child) => renderWithHtmlBreaks(child));
  }

  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode; [key: string]: any };
    if (props && props.children) {
      return React.cloneElement(
        children,
        undefined,
        renderWithHtmlBreaks(props.children)
      );
    }
  }

  return children;
}

/**
 * Intelligently renders bullet points with clean hanging indent and emerald markers.
 */
function renderSmartBullets(content: React.ReactNode): React.ReactNode {
  if (typeof content === 'string') {
    if (content.includes('•') || content.includes('<br')) {
      const rawParts = content.split(/(?:<br\s*\/?>|\n)/gi).map(s => s.trim()).filter(Boolean);
      if (rawParts.length > 1 || rawParts.some(p => p.startsWith('•') || p.startsWith('-'))) {
        return (
          <div className="space-y-1.5 py-0.5">
            {rawParts.map((part, idx) => {
              const isBullet = part.startsWith('•') || part.startsWith('-');
              const cleanText = isBullet ? part.replace(/^[•\-]\s*/, '') : part;
              return (
                <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                  {isBullet && (
                    <span className="text-emerald-400 font-bold select-none shrink-0 mt-0.5">•</span>
                  )}
                  <span className="flex-1">{cleanText}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }
    return content;
  }

  if (Array.isArray(content)) {
    return React.Children.map(content, (item) => renderSmartBullets(item));
  }

  if (React.isValidElement(content)) {
    const props = content.props as { children?: React.ReactNode; [key: string]: any };
    if (props && props.children) {
      return React.cloneElement(
        content,
        undefined,
        renderSmartBullets(props.children)
      );
    }
  }

  return content;
}

/**
 * Renders cell content tailored to the column's role.
 * In metric columns, short numbers are housed in an elevated stat capsule.
 */
function renderSmartCellContent(children: React.ReactNode, role: ColumnMeta['role']): React.ReactNode {
  if (role === 'metric') {
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800/90 font-mono text-emerald-300 font-semibold text-xs shadow-inner whitespace-nowrap">
        {renderWithHtmlBreaks(children)}
      </div>
    );
  }

  if (role === 'prose') {
    return renderSmartBullets(renderWithHtmlBreaks(children));
  }

  return renderWithHtmlBreaks(children);
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Pre-process common HTML tags generated by LLMs to standard markdown or clean spaces
  const sanitizedContent = useMemo(() => {
    if (!content) return '';
    let processed = content;
    // Normalize raw bold/italic tags
    processed = processed.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    processed = processed.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    processed = processed.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    processed = processed.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    // Replace non-breaking spaces
    processed = processed.replace(/&nbsp;/gi, ' ');
    return processed;
  }, [content]);

  return (
    <div className={`prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, children, ...props }: any) => {
            const columns = analyzeTableColumns(node);
            const hasMultipleCols = columns.length > 3;

            return (
              <TableMetaContext.Provider value={{ columns }}>
                <div className="my-4 overflow-hidden rounded-xl border border-slate-800/90 bg-[#0a0d16]/95 shadow-xl glass-panel relative">
                  {hasMultipleCols && (
                    <div className="flex sm:hidden items-center justify-between px-3 py-1 bg-slate-950/80 border-b border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>Tabel Multi-Kolom</span>
                      <span className="text-emerald-400">Geser ke kanan ↔</span>
                    </div>
                  )}
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left text-xs divide-y divide-slate-800/70 border-collapse" {...props}>
                      {children}
                    </table>
                  </div>
                </div>
              </TableMetaContext.Provider>
            );
          },
          thead: ({ node, ...props }: any) => (
            <thead className="bg-[#0d121e]/95 border-b border-slate-800/90 tracking-wider text-[11px]" {...props} />
          ),
          tbody: ({ node, ...props }: any) => (
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300" {...props} />
          ),
          tr: ({ node, children, ...props }: any) => (
            <tr className="hover:bg-slate-800/30 transition-colors group" {...props}>
              {React.Children.map(children, (child, colIndex) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { colIndex } as any);
                }
                return child;
              })}
            </tr>
          ),
          th: ({ node, colIndex = 0, children, ...props }: any) => {
            return (
              <TableMetaContext.Consumer>
                {({ columns }) => {
                  const meta = columns[colIndex] || { role: 'standard' };

                  let widthClass = 'min-w-[130px] max-w-[200px]';
                  let alignClass = 'text-left';
                  let colorClass = 'text-slate-200';

                  if (meta.role === 'identifier') {
                    widthClass = 'min-w-[120px] sm:min-w-[145px] max-w-[190px] sticky left-0 z-20 bg-[#0d121e] border-r-2 border-slate-700/80 shadow-[4px_0_12px_rgba(0,0,0,0.6)]';
                    colorClass = 'text-emerald-400 font-bold';
                  } else if (meta.role === 'metric') {
                    // Tightly sized metric header with natural wrap
                    widthClass = 'w-[105px] sm:w-[125px] min-w-[95px] max-w-[140px] shrink-0';
                    alignClass = 'text-left';
                    colorClass = 'text-slate-300 font-semibold';
                  } else if (meta.role === 'prose') {
                    // Generous width priority for narrative / bullet content
                    widthClass = 'min-w-[280px] sm:min-w-[340px] max-w-[500px] flex-1';
                    colorClass = 'text-emerald-300 font-semibold';
                  }

                  return (
                    <th
                      className={`py-3 px-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-normal break-words align-top leading-snug ${widthClass} ${alignClass} ${colorClass}`}
                      {...props}
                    >
                      {renderSmartHeaderContent(children, meta.role)}
                    </th>
                  );
                }}
              </TableMetaContext.Consumer>
            );
          },
          td: ({ node, colIndex = 0, children, ...props }: any) => {
            return (
              <TableMetaContext.Consumer>
                {({ columns }) => {
                  const meta = columns[colIndex] || { role: 'standard' };

                  let widthClass = 'min-w-[130px] max-w-[200px]';
                  let alignClass = 'text-left';

                  if (meta.role === 'identifier') {
                    widthClass = 'min-w-[120px] sm:min-w-[145px] max-w-[190px] sticky left-0 z-10 bg-[#0a0d16] group-hover:bg-[#101625] transition-colors border-r-2 border-slate-700/80 shadow-[4px_0_12px_rgba(0,0,0,0.6)] font-bold text-white';
                  } else if (meta.role === 'metric') {
                    widthClass = 'w-[105px] sm:w-[125px] min-w-[95px] max-w-[140px] shrink-0';
                    alignClass = 'text-left';
                  } else if (meta.role === 'prose') {
                    widthClass = 'min-w-[280px] sm:min-w-[340px] max-w-[500px]';
                  }

                  return (
                    <td
                      className={`py-3.5 px-3.5 align-top leading-relaxed text-slate-300 whitespace-normal break-words ${widthClass} ${alignClass}`}
                      {...props}
                    >
                      {renderSmartCellContent(children, meta.role)}
                    </td>
                  );
                }}
              </TableMetaContext.Consumer>
            );
          },
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </h1>
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-2" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </h2>
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-emerald-400 mt-2.5 mb-1" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </h3>
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-300" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </p>
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-slate-300 pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-slate-300 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-emerald-300" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </strong>
          ),
          em: ({ node, ...props }) => (
            <em className="text-cyan-300 not-italic font-medium" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </em>
          ),
          code: ({ node, inline, ...props }: any) => (
            inline ? (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px]" {...props} />
            ) : (
              <pre className="p-3 my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300">
                <code {...props} />
              </pre>
            )
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="p-3 my-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 italic" {...props}>
              {renderWithHtmlBreaks(props.children)}
            </blockquote>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};
