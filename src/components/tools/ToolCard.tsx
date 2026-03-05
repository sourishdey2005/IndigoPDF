
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
  className?: string;
}

export function ToolCard({ title, description, icon: Icon, href, category, className }: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href}>
        <Card className={cn(
          "h-full hover:shadow-xl transition-all border-none bg-white dark:bg-slate-900/50 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary/50 dark:hover:ring-primary/50 backdrop-blur-sm",
          className
        )}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Icon size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                  {category}
                </span>
                <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
