import { useState } from "react";
import { Search, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/data/blogPosts";

interface SidebarProps {
  posts: BlogPost[];
  activePostId: string;
  onSelectPost: (postId: string) => void;
}

export const Sidebar = ({ posts, activePostId, onSelectPost }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group posts by category
  const postsByCategory = filteredPosts.reduce((acc, post) => {
    if (!acc[post.category]) {
      acc[post.category] = [];
    }
    acc[post.category].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  return (
    <aside className="w-[260px] border-r border-border p-4 bg-sidebar-bg flex flex-col shrink-0">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted-foreground" />
        <input
          type="text"
          placeholder="Search blog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-input border border-border rounded-md py-2 pl-8 pr-3 text-foreground text-[13px] outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      {/* Navigation sections */}
      <nav className="flex flex-col gap-6 overflow-y-auto flex-1">
        {Object.entries(postsByCategory).map(([category, categoryPosts]) => (
          <div key={category}>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 pl-2">
              {category}
            </div>
            <ul className="space-y-0.5">
              {categoryPosts.map((post) => (
                <li key={post.id}>
                  <button
                    onClick={() => onSelectPost(post.id)}
                    className={cn(
                      "w-full flex items-center justify-between text-left px-2.5 py-[7px] rounded-md text-[13.5px] transition-all",
                      activePostId === post.id
                        ? "bg-hover-bg text-foreground font-medium"
                        : "text-muted-foreground hover:bg-hover-bg hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-[14px] h-[14px] opacity-70" />
                      <span>{post.title}</span>
                    </span>
                    <ChevronRight className="w-3 h-3 opacity-30" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
