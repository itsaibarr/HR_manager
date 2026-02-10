"use client";

import { useDensity, Density } from "@/lib/contexts/DensityContext";
import { cn } from "@/lib/utils";
import { AlignJustify, List, Rows } from "lucide-react";

export function DensityToggle({ showLabel = true }: { showLabel?: boolean }) {
    const { density, setDensity } = useDensity();

    const options: { value: Density; label: string; icon: React.ElementType }[] = [
        { value: "compact", label: "Compact", icon: AlignJustify },
        { value: "comfortable", label: "Comfortable", icon: List },
        { value: "spacious", label: "Spacious", icon: Rows },
    ];

    return (
        <div className="flex flex-col gap-1">
            {showLabel && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Information Density
                </span>
            )}
            <div className="bg-paper border border-border/60 rounded-sm p-1 flex gap-1 w-fit">
                {options.map((option) => {
                    const isActive = density === option.value;
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            onClick={() => setDensity(option.value)}
                            className={cn(
                                "flex items-center gap-2 px-3 h-8 rounded-sm transition-all text-[11px] font-bold uppercase tracking-wider",
                                isActive
                                    ? "bg-primary text-paper shadow-sm"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-paper" : "text-muted-foreground")} strokeWidth={2.4} />
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
