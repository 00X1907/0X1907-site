 import { cn } from "@/lib/utils";
 import { AlertCircle, Lightbulb, Info, HelpCircle, AlertTriangle } from "lucide-react";
 
 export type CalloutVariant = "note" | "tip" | "warning" | "question";
 
 interface CalloutProps {
   variant: CalloutVariant;
   title: string;
   children: React.ReactNode;
 }
 
 const variantConfig = {
   note: {
     icon: Info,
     label: "Note",
     borderColor: "border-l-blue-500/70",
     headerBg: "bg-blue-500/10",
     iconColor: "text-blue-500",
   },
   tip: {
     icon: Lightbulb,
     label: "Tip",
     borderColor: "border-l-emerald-500/70",
     headerBg: "bg-emerald-500/10",
     iconColor: "text-emerald-500",
   },
   warning: {
     icon: AlertTriangle,
     label: "Warning",
     borderColor: "border-l-amber-500/70",
     headerBg: "bg-amber-500/10",
     iconColor: "text-amber-500",
   },
   question: {
     icon: HelpCircle,
     label: "Question",
     borderColor: "border-l-purple-500/70",
     headerBg: "bg-purple-500/10",
     iconColor: "text-purple-500",
   },
 };
 
 export const Callout = ({ variant, title, children }: CalloutProps) => {
   const config = variantConfig[variant];
   const Icon = config.icon;
 
   return (
     <div
       className={cn(
         "my-6 rounded-lg border border-border overflow-hidden",
         "border-l-[3px]",
         config.borderColor
       )}
     >
       {/* Header */}
       <div
         className={cn(
           "flex items-center gap-2.5 px-4 py-3",
           config.headerBg
         )}
       >
         <Icon className={cn("w-4 h-4 shrink-0", config.iconColor)} />
         <span className="font-medium text-[15px] text-foreground">
           {title}
         </span>
       </div>
       {/* Body */}
       <div className="px-4 py-3 text-[15px] leading-relaxed text-foreground/90 bg-muted/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-background/60 [&_code]:text-[13px] [&_code]:font-mono">
         {children}
       </div>
     </div>
   );
 };