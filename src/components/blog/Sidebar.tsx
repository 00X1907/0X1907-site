import { useState, useMemo, useEffect } from "react";
import { Search, FileText, ChevronRight, ChevronLeft, Folder, FolderOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMetadata } from "@/data/blogPosts";

interface FolderNode {
  name: string;
  path: string;
  subfolders: Record<string, FolderNode>;
  posts: PostMetadata[];
}

interface SidebarProps {
  posts: PostMetadata[];
  activePostId: string;
  onSelectPost: (postId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  initialActiveFolder?: string | null;
}

export const Sidebar = ({ posts, activePostId, onSelectPost, isOpen = true, initialActiveFolder }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(initialActiveFolder ?? null);

  // Update activeFolder when initialActiveFolder changes
  useEffect(() => {
    if (initialActiveFolder !== undefined) {
      setActiveFolder(initialActiveFolder);
    }
  }, [initialActiveFolder]);

  // Filter posts by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  // Group posts by category (simple, single level)
  const postsByCategory = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (!acc[post.category]) {
        acc[post.category] = [];
      }
      acc[post.category].push(post);
      return acc;
    }, {} as Record<string, PostMetadata[]>);
  }, [posts]);

  const categories = Object.keys(postsByCategory);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <aside
      className={cn(
        "w-[280px] border-r border-border bg-sidebar-bg flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        "fixed md:relative inset-y-0 left-0 z-40 md:z-auto",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:border-0 md:overflow-hidden"
      )}
    >
      {/* Search */}
      <div className="p-4 pb-0">
        <div className="relative mb-4">
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground/80" />
          <input
            type="text"
            placeholder="Search blog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border border-border rounded-md py-2 pl-8 pr-3 text-foreground text-[13.5px] outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Search Results - shown when searching */}
      {isSearching ? (
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 pl-2">
            Results ({searchResults.length})
          </div>
          {searchResults.length === 0 ? (
            <p className="text-[14px] text-muted-foreground/80 pl-2">No posts found</p>
          ) : (
            <ul className="space-y-0.5">
              {searchResults.map((post) => (
                <li key={post.id}>
                  <button
                    onClick={() => onSelectPost(post.id)}
                    className={cn(
                      "w-full flex flex-col text-left px-2.5 py-2 rounded-md text-[14px] transition-all",
                      activePostId === post.id
                        ? "bg-hover-bg text-foreground"
                        : "text-muted-foreground hover:bg-hover-bg hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-[14px] h-[14px] opacity-80 shrink-0" />
                      <span className={cn("truncate", activePostId === post.id && "font-medium")}>{post.title}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground/80 ml-6 truncate">{post.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Sliding panels */
        <div className="flex-1 overflow-hidden relative">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: activeFolder ? "translateX(-100%)" : "translateX(0)" }}
          >
            {/* Panel 1: Folders list */}
            <div className="w-full shrink-0 p-4 pt-0 overflow-y-auto">
              <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 pl-2">
                Folders
              </div>
              <ul className="space-y-0.5">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setActiveFolder(category)}
                      className="w-full flex items-center justify-between text-left px-2.5 py-[8px] rounded-md text-[14px] transition-all text-muted-foreground hover:bg-hover-bg hover:text-foreground"
                    >
                      <span className="flex items-center gap-2.5">
                        <Folder className="w-[15px] h-[15px] opacity-80" />
                        <span>{category}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel 2: Posts in folder */}
            <div className="w-full shrink-0 p-4 pt-0 overflow-y-auto">
              <button
                onClick={() => setActiveFolder(null)}
                className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-3 pl-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2 text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 pl-2">
                <FolderOpen className="w-4 h-4" />
                <span>{activeFolder}</span>
              </div>

              <ul className="space-y-0.5">
                {activeFolder && postsByCategory[activeFolder]?.map((post) => (
                  <li key={post.id}>
                    <button
                      onClick={() => onSelectPost(post.id)}
                      className={cn(
                        "w-full flex items-center justify-between text-left px-2.5 py-[8px] rounded-md text-[14px] transition-all",
                        activePostId === post.id
                          ? "bg-hover-bg text-foreground font-medium"
                          : "text-muted-foreground hover:bg-hover-bg hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <FileText className="w-[15px] h-[15px] opacity-80" />
                        <span className="truncate">{post.title}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
