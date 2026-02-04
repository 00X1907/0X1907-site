import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/blog/TopBar";
import { Sidebar } from "@/components/blog/Sidebar";
import { BlogContent } from "@/components/blog/BlogContent";
import { loadMarkdownPosts, type BlogPost } from "@/data/blogPosts";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePostId, setActivePostId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await loadMarkdownPosts();
        setPosts(loadedPosts);
        // If postId is provided in URL, use it; otherwise use first post
        if (postId && loadedPosts.some(p => p.id === postId)) {
          setActivePostId(postId);
        } else if (loadedPosts.length > 0) {
          setActivePostId(loadedPosts[0].id);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [postId]);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSelectPost = (id: string) => {
    setActivePostId(id);
    navigate(`/blog/${id}`);
    // Close sidebar on mobile after selecting a post
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const activePost = posts.find((post) => post.id === activePostId) || posts[0];

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          posts={posts}
          activePostId={activePostId}
          onSelectPost={handleSelectPost}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {activePost && <BlogContent post={activePost} />}
      </div>
    </div>
  );
};

export default Index;
