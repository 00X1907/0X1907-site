import { CodeBlock } from "./CodeBlock";
import { TableOfContents, generateId } from "./TableOfContents";
import type { BlogPost, ContentBlock } from "@/data/blogPosts";
import { useState } from "react";
import { ImagePreview } from "./ImagePreview";
import { LazyImage } from "./LazyImage";
import { cn } from "@/lib/utils";
import { Callout } from "./Callout";
import { GiscusComments } from "./GiscusComments";
import { TagList } from "./TagBadge";

interface BlogContentProps {
  post: BlogPost;
}

// Helper to render text with inline code (backticks)
const renderInlineCode = (text: string): React.ReactNode => {
  if (!text.includes("`")) return text;
  
  return text.split("`").map((part, i) =>
    i % 2 === 0 ? part : <code key={i}>{part}</code>
  );
};

export const BlogContent = ({ post }: BlogContentProps) => {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);

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
      
      case "image":
        return (
          <LazyImage
            key={index}
            src={block.content || ""}
            alt={block.alt}
            onClick={() => setPreviewImage({ src: block.content || "", alt: block.alt })}
          />
        );
      
      case "table":
        return (
          <div key={index} className="my-6 overflow-hidden rounded-lg border border-border [&_table]:m-0">
            <table className="w-full text-[15px] border-collapse !m-0">
              <thead>
                <tr className="bg-[#1a1a1a]">
                  {block.tableHeaders?.map((header, i) => (
                    <th
                      key={i}
                      className={cn(
                        "px-5 py-4 text-left font-semibold text-foreground",
                        i !== 0 && "border-l border-border"
                      )}
                    >
                      {renderInlineCode(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableRows?.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#1a1a1a]"}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn(
                          "px-5 py-4 text-muted-foreground",
                          cellIndex !== 0 && "border-l border-border"
                        )}
                      >
                        {renderInlineCode(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case "callout":
        return (
          <Callout
            key={index}
            variant={block.calloutVariant || "note"}
            title={block.calloutTitle || "Note"}
          >
            {renderInlineCode(block.content || "")}
          </Callout>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <main className="flex-1 py-8 md:py-[60px] px-4 sm:px-6 md:px-10 md:pl-12 overflow-y-auto overflow-x-hidden bg-background">
        <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          <article key={post.id} className="w-full lg:max-w-[700px] blog-prose min-w-0 lg:flex-1 animate-fade-in-up">
            <h1>{post.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-6 mt-[-16px]">
              {post.date && (
                <span className="text-muted-foreground text-sm">
                  {post.date}
                </span>
              )}
              {post.tags && post.tags.length > 0 && (
                <>
                  {post.date && <span className="text-muted-foreground/50">·</span>}
                  <TagList tags={post.tags} size="sm" linkToTagPage />
                </>
              )}
            </div>
            {post.content.map((block, index) => renderContentBlock(block, index))}
            
            {/* Giscus Comments Section */}
            <GiscusComments />
          </article>
        </div>
      </main>
      <TableOfContents content={post.content} />
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
};
