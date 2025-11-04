"use client";

import {
  Package,
  Users,
  Building2,
  Ban,
  ListOrdered,
  type LucideIcon,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { keyof } from "zod";

interface EmptyStateProps {
  variant?: keyof typeof variants | "custom";
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const variants = {
  inventory: {
    icon: Package,
    title: "No Inventory Items",
    description: "No results were found matching your request.",
  },
  person: {
    icon: Users,
    title: "No People Found",
    description: "No results were found matching your request.",
  },
  company: {
    icon: Building2,
    title: "No Companies Found",
    description: "No results were found matching your request.",
  },
  blocked: {
    icon: Ban,
    title: "No Blocked Companies",
    description:
      "You haven't blocked any companies. Companies you block will appear here for easy management.",
  },
  priority: {
    icon: ListOrdered,
    title: "No Priority Set",
    description:
      "You haven't set any priority order yet. Add companies and arrange them by importance.",
  },
  cart: {
    icon: ShoppingCart,
    title: "No Cart Items",
    description: "Your cart is empty. Add items to see them listed here.",
  },
};

export function EmptyState({
  variant = "custom",
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config =
    variant !== "custom"
      ? variants[variant]
      : {
          icon: CustomIcon!,
          title: customTitle!,
          description: customDescription!,
        };

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 md:p-8 rounded-full">
          <Icon
            className="h-12 w-12 md:h-16 md:w-16 text-primary"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-semibold mb-2">{config.title}</h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-md mb-6">
        {config.description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
