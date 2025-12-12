import React from 'react'
import MarkdownComponent from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { useTheme } from 'next-themes'

/**
 * Helper function to recursively extract text content from nested React children/nodes.
 * This is CRITICAL when using plugins like rehype-highlight, which inject elements (objects) 
 * that break simple Array.join('') and lead to the [object Object] error.
 * @param children The children array/object passed to the component.
 * @returns A concatenated string of all text content.
 */
const getStringContent = (children: React.ReactNode): string => {
  return React.Children.toArray(children).reduce((acc: string, child) => { // 💡 FIX 1: Explicitly type accumulator as string
    if (typeof child === 'string') {
      return acc + child;
    }
    
    // If the child is a React element, recursively look inside its props.children
    if (React.isValidElement(child) && child.props && (child.props as { children: React.ReactNode }).children) {
      // 💡 FIX 2: Ensure the result of the recursive call is treated as a string before concatenation
      return acc + (getStringContent((child.props as { children: React.ReactNode }).children) as string);
    }
    
    // Convert numbers/bigints/etc. to string for concatenation. This addresses the "Type 'number' is not assignable to type 'string'"
    if (typeof child === 'number' || typeof child === 'bigint') {
        return acc + String(child);
    }
    
    // For any other unexpected object, try simple string conversion as a last resort
    // but the recursive call above should cover most cases.
    return acc + ''; 
  }, '');
};

export const Markdown = ({ children }: { children: string }) => {
  const theme = useTheme();
  const isDark = theme.theme !== "dark";
  return (
    <MarkdownComponent remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={{
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      code({ node, className, children, ref, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const codeString = getStringContent(children);
        return match ? (
          <SyntaxHighlighter
            {...props}
            customStyle={{ fontFamily: "myCustomFont, myCustomFont Fallback", margin: "inherit" }}
            style={isDark ? coldarkDark : ghcolors}
            language={match[1]}
            PreTag="div"
          >
            {codeString.replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code {...props} className={className}>
            {codeString}
          </code>
        );
      },
  }}>
      {children}
    </MarkdownComponent>
  )
}