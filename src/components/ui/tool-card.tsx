
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: string | LucideIcon;
  tools: string[];
  onClick?: () => void;
  variant?: "default" | "highlighted";
}

export function ToolCard({
  title,
  description,
  icon,
  tools,
  onClick,
  variant = "default",
}: ToolCardProps) {
  const Icon = typeof icon === 'string' ? null : icon;
  const variantClasses = {
    default: "bg-gradient-to-br from-card via-card to-card/80 shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02] hover:brightness-110",
    highlighted: "bg-gradient-to-br from-primary/5 via-card to-secondary/10 ring-2 ring-primary/30 shadow-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-[1.02] hover:brightness-110 hover:ring-primary/50",
  };

  return (
    <Card
      className={cn(
        "p-6 cursor-pointer group relative overflow-hidden border border-border/50 hover:border-primary/30 backdrop-blur-sm",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "after:absolute after:inset-0 after:bg-gradient-to-t after:from-background/10 after:to-transparent after:pointer-events-none",
        variantClasses[variant]
      )}
      onClick={onClick}
    >
      {/* Enhanced glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500 shadow-sm group-hover:shadow-md group-hover:shadow-primary/20 group-hover:scale-110">
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              <Icon className="h-6 w-6 text-primary group-hover:text-primary transition-all duration-500 group-hover:drop-shadow-sm" />
            )}
          </div>
          <Heading level={3} className="text-card-foreground group-hover:text-primary transition-all duration-500 group-hover:drop-shadow-sm">
            {title}
          </Heading>
        </div>
        
        <Text className="text-muted-foreground group-hover:text-card-foreground transition-all duration-500 leading-relaxed">
          {description}
        </Text>
        
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-secondary/80 text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-all duration-500 shadow-sm hover:shadow-md hover:shadow-primary/10 hover:scale-105 backdrop-blur-sm border border-border/30"
            >
              {tool}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
