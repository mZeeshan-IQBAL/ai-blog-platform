// components/PostContent.jsx
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

export default function PostContent({ content }) {
  return <MarkdownRenderer content={content} />;
}