import { useState } from "react";
import { TopBar } from "@/components/blog/TopBar";
import { Sidebar } from "@/components/blog/Sidebar";
import { BlogContent } from "@/components/blog/BlogContent";
import { blogPosts } from "@/data/blogPosts";

const Index = () => {
  const [activePostId, setActivePostId] = useState(blogPosts[0]?.id || "intro");

  const activePost = blogPosts.find((post) => post.id === activePostId) || blogPosts[0];

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          posts={blogPosts}
          activePostId={activePostId}
          onSelectPost={setActivePostId}
        />
        {activePost && <BlogContent post={activePost} />}
      </div>
    </div>
  );
};

export default Index;
