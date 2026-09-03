'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0a0d16] shadow-md">
              <table className="w-full text-left text-xs divide-y divide-slate-800" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-900/90 text-emerald-400 font-bold uppercase tracking-wider text-[11px]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="py-2.5 px-3.5 font-semibold text-slate-200 whitespace-nowrap" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-800/40 transition-colors" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="py-2 px-3.5 align-middle" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-emerald-400 mt-2.5 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-slate-300 pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-slate-300 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-emerald-300" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-cyan-300 not-italic font-medium" {...props} />
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
            <blockquote className="border-l-2 border-emerald-500/60 pl-3 my-2 text-slate-400 italic bg-emerald-500/5 py-1 rounded-r-lg" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
