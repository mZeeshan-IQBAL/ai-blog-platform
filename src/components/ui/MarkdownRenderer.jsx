// components/MarkdownRenderer.jsx
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

export default function MarkdownRenderer({ content }) {
  const processed = remark().use(remarkGfm).use(html).processSync(content).toString();
  return <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: processed }} />;
}
