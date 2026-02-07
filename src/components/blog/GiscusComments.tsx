import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

export const GiscusComments = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing comments when theme changes
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    
    script.setAttribute("data-repo", "U1907/U1907-site");
    script.setAttribute("data-repo-id", "R_kgDORHh4Qw");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDORHh4Q84C15-N");
    
    // Mapping and features (based on your screenshot settings)
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", theme === "dark" ? "transparent_dark" : "light");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <section className="mt-16">
      {/* End of article indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className="h-px flex-1 bg-border" />
        <span className="text-muted-foreground text-sm">✦ ✦ ✦</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Comments section */}
      <div className="pt-8">
        <h2 className="text-xl font-semibold mb-6">Comments</h2>
        <div ref={containerRef} className="giscus-container" />
      </div>
    </section>
  );
};
