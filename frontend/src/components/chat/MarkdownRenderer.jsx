import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownComponents = {
  p: ({ children }) => <p style={{ marginBottom: 8, color: 'var(--text-primary)', fontSize: 14 }}>{children}</p>,
  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, marginTop: 10 }}>{children}</h3>,
  ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 8 }}>{children}</ul>,
  li: ({ children }) => <li style={{ marginBottom: 4, color: 'var(--text-secondary)', fontSize: 13 }}>{children}</li>,
  code: ({ children }) => <code style={{ background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: '#818cf8' }}>{children}</code>,
  strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>,
};

const MarkdownRenderer = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
    {content}
  </ReactMarkdown>
);

export default MarkdownRenderer;
