import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/data/blogPosts";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: ContentBlock[];
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from content
  const headings: TOCItem[] = content
    .filter((block) => block.type === "heading" && block.level && block.level <= 3)
    .map((block) => ({
      id: generateId(block.content || ""),
      text: block.content || "",
      level: block.level || 2,
    }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block w-[200px] shrink-0">
      <div className="sticky top-[100px]">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          <Menu className="w-3.5 h-3.5" />
          <span>On This Page</span>
        </div>
        <ul className="space-y-1 border-l border-border">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "block w-full text-left text-[13px] py-1 transition-colors border-l-2 -ml-px",
                  heading.level === 1 && "pl-3",
                  heading.level === 2 && "pl-3",
                  heading.level === 3 && "pl-6",
                  activeId === heading.id
                    ? "border-foreground text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// Generate a URL-friendly ID from heading text
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export { generateId };
