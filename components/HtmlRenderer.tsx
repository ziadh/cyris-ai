"use client";
import { useEffect } from 'react';

interface HtmlRendererProps {
  htmlContent: string;
  className?: string;
  isDarkTheme?: boolean;
}

export default function HtmlRenderer({ htmlContent, className = "", isDarkTheme = false }: HtmlRendererProps) {
  useEffect(() => {
    // Apply syntax highlighting to code blocks after component mounts
    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
    codeBlocks.forEach((block) => {
      // Basic syntax highlighting classes for common languages
      const codeElement = block as HTMLElement;
      const language = Array.from(codeElement.classList)
        .find(cls => cls.startsWith('language-'))
        ?.replace('language-', '');
      
      if (language) {
        codeElement.style.background = isDarkTheme ? '#1e1e1e' : '#f8f8f8';
        codeElement.style.border = isDarkTheme ? '1px solid #3e3e3e' : '1px solid #e1e5e9';
        codeElement.style.color = isDarkTheme ? '#e1e4e8' : '#24292e';
        codeElement.style.borderRadius = '6px';
        codeElement.style.padding = '16px';
        codeElement.style.fontSize = '14px';
        codeElement.style.lineHeight = '1.5';
        codeElement.style.overflow = 'auto';
        codeElement.style.position = 'relative';
        
        // Add copy button
        const preElement = codeElement.parentElement as HTMLPreElement;
        if (preElement && preElement.tagName === 'PRE') {
          preElement.style.position = 'relative';
          
          // Check if copy button already exists
          if (!preElement.querySelector('.copy-button')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '📋';
            copyButton.style.position = 'absolute';
            copyButton.style.top = '8px';
            copyButton.style.right = '8px';
            copyButton.style.background = isDarkTheme ? '#333' : '#e1e5e9';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.fontSize = '12px';
            copyButton.style.opacity = '0.7';
            copyButton.style.transition = 'opacity 0.2s';
            
            copyButton.addEventListener('mouseenter', () => {
              copyButton.style.opacity = '1';
            });
            
            copyButton.addEventListener('mouseleave', () => {
              copyButton.style.opacity = '0.7';
            });
            
            copyButton.addEventListener('click', async () => {
              try {
                await navigator.clipboard.writeText(codeElement.textContent || '');
                copyButton.innerHTML = '✅';
                setTimeout(() => {
                  copyButton.innerHTML = '📋';
                }, 2000);
              } catch (err) {
                console.error('Failed to copy text: ', err);
              }
            });
            
            preElement.appendChild(copyButton);
          }
        }
      }
    });

    // Style inline code elements
    const inlineCodeElements = document.querySelectorAll('code:not(pre code)');
    inlineCodeElements.forEach((element) => {
      const codeElement = element as HTMLElement;
      codeElement.style.background = isDarkTheme ? '#2d2d2d' : '#f6f8fa';
      codeElement.style.color = isDarkTheme ? '#e1e4e8' : '#24292e';
      codeElement.style.padding = '2px 4px';
      codeElement.style.borderRadius = '3px';
      codeElement.style.fontSize = '85%';
      codeElement.style.fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace';
    });

    // Style blockquotes with theme-specific colors
    const blockquotes = document.querySelectorAll('blockquote');
    blockquotes.forEach((element) => {
      const blockquoteElement = element as HTMLElement;
      blockquoteElement.style.borderLeft = isDarkTheme ? '4px solid #30363d' : '4px solid #d0d7de';
      blockquoteElement.style.paddingLeft = '16px';
      blockquoteElement.style.margin = '16px 0';
      blockquoteElement.style.color = isDarkTheme ? '#8b949e' : '#656d76';
    });
  }, [htmlContent, isDarkTheme]);

    return (
    <div 
      className={`html-content prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        color: isDarkTheme ? '#e6edf3' : '#24292f'
      }}
    />
  );
} 