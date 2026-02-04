import { CodeBlock } from "./CodeBlock";
import { TableOfContents, generateId } from "./TableOfContents";
import type { BlogPost, ContentBlock } from "@/data/blogPosts";

interface BlogContentProps {
  post: BlogPost;
}

const renderContentBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case "paragraph":
      return <p key={index}>{block.content}</p>;
    
    case "heading":
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      const headingId = generateId(block.content || "");
      return (
        <HeadingTag key={index} id={headingId}>
          {block.content}
        </HeadingTag>
      );
    
    case "code":
      return (
        <CodeBlock
          key={index}
          code={block.content || ""}
          language={block.language}
          filename={block.filename}
        />
      );
    
    case "list":
      return (
        <ul key={index}>
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    
    case "ordered-list":
      return (
        <ol key={index}>
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    
    case "blockquote":
      return <blockquote key={index}>{block.content}</blockquote>;
    
    case "divider":
      return <hr key={index} />;
    
    case "inline-code":
      return (
        <p key={index}>
          {block.content?.split("`").map((part, i) =>
            i % 2 === 0 ? part : <code key={i}>{part}</code>
          )}
        </p>
      );
    
    default:
      return null;
  }
};

export const BlogContent = ({ post }: BlogContentProps) => {
  return (
    <main className="flex-1 py-8 md:py-[60px] px-4 md:px-20 overflow-y-auto bg-background">
      <div className="flex gap-12">
        <article className="max-w-[700px] mx-auto md:mx-0 blog-prose flex-1">
          <h1>{post.title}</h1>
          {post.date && (
            <p className="text-muted-foreground text-sm mb-6 mt-[-16px]">
              {post.date}
            </p>
          )}
          {post.content.map((block, index) => renderContentBlock(block, index))}
        </article>
        <TableOfContents content={post.content} />
      </div>
    </main>
  );
};
