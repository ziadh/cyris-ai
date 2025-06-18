"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isDarkTheme?: boolean;
}

export default function MarkdownRenderer({ content, className = "", isDarkTheme = false }: MarkdownRendererProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      data-theme={isDarkTheme ? 'dark' : 'light'}
      style={{ color: isDarkTheme ? '#e6edf3' : '#24292f' }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

            if (!inline && language) {
              return (
                <div className="code-block-container" style={{ position: 'relative', margin: '16px 0' }}>
                  <button
                    onClick={() => copyToClipboard(codeContent, codeId)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: copiedStates[codeId] 
                        ? '#28a745' 
                        : isDarkTheme 
                          ? '#444' 
                          : '#f1f3f4',
                      color: copiedStates[codeId] 
                        ? 'white' 
                        : isDarkTheme 
                          ? '#e1e4e8' 
                          : '#24292e',
                      border: copiedStates[codeId] 
                        ? '1px solid #28a745' 
                        : isDarkTheme 
                          ? '1px solid #555' 
                          : '1px solid #d1d5da',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      opacity: 0.8,
                      transition: 'all 0.2s ease',
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      if (!copiedStates[codeId]) {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.background = isDarkTheme ? '#555' : '#e1e4e8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copiedStates[codeId]) {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.background = isDarkTheme ? '#444' : '#f1f3f4';
                      }
                    }}
                  >
                    {copiedStates[codeId] ? 'Copied!' : 'Copy'}
                  </button>
                  <SyntaxHighlighter
                    style={isDarkTheme ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '6px',
                      border: isDarkTheme ? '1px solid #30363d' : '1px solid #d1d5da',
                      boxShadow: isDarkTheme ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                        fontSize: '14px',
                        lineHeight: '1.45',
                      }
                    }}
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Inline code
            return (
              <code
                className={className}
                style={{
                  background: isDarkTheme ? '#21262d' : '#f3f4f6',
                  color: isDarkTheme ? '#79c0ff' : '#1f2328',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '85%',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  border: isDarkTheme ? '1px solid #30363d' : '1px solid #d0d7de',
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote
              style={{
                borderLeft: isDarkTheme ? '4px solid #f78166' : '4px solid #d0d7de',
                paddingLeft: '16px',
                margin: '16px 0',
                color: isDarkTheme ? '#8b949e' : '#656d76',
                background: isDarkTheme 
                  ? 'rgba(110, 118, 129, 0.1)' 
                  : 'rgba(175, 184, 193, 0.1)',
                padding: '8px 16px',
                borderRadius: '6px',
              }}
              {...props}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children, ...props }) => (
            <h1
              style={{
                color: 'inherit',
                fontWeight: '600',
                lineHeight: '1.25',
                marginTop: '24px',
                marginBottom: '16px',
              }}
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              style={{
                color: 'inherit',
                fontWeight: '600',
                lineHeight: '1.25',
                marginTop: '24px',
                marginBottom: '16px',
              }}
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              style={{
                color: 'inherit',
                fontWeight: '600',
                lineHeight: '1.25',
                marginTop: '24px',
                marginBottom: '16px',
              }}
              {...props}
            >
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p
              style={{
                color: 'inherit',
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul
              style={{
                paddingLeft: '20px',
                margin: '8px 0',
                color: 'inherit',
              }}
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              style={{
                paddingLeft: '20px',
                margin: '8px 0',
                color: 'inherit',
              }}
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li
              style={{
                color: 'inherit',
                marginBottom: '4px',
              }}
              {...props}
            >
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong
              style={{
                color: 'inherit',
                fontWeight: '600',
              }}
              {...props}
            >
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em
              style={{
                color: 'inherit',
              }}
              {...props}
            >
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 