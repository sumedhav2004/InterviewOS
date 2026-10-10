"use client";

import {
    Code2,
    PenTool,
    LightbulbIcon,
    Lightbulb
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { InterviewWorkspaceType } from "../../types/interview";



type InterviewWorkspaceTabsProps = {
    value: InterviewWorkspaceType;
    onChange: (
        workspace: InterviewWorkspaceType,
    ) => void;
};

const workspaces = [
    {
        id: "CODE" as const,
        label: "Code",
        icon: Code2,
    },
    {
        id: "WHITEBOARD" as const,
        label: "Whiteboard",
        icon: PenTool,
    },
    {
        id: "FIGMA" as const,
        label: "Figma",
        icon: Lightbulb,
    },
];

export function InterviewWorkspaceTabs({
    value,
    onChange,
}: InterviewWorkspaceTabsProps) {
    return (
        <div className="flex items-center gap-1">
            {workspaces.map((workspace) => {
                const Icon = workspace.icon;
                const active =
                    value === workspace.id;

                return (
                    <Button
                        key={workspace.id}
                        type="button"
                        variant={
                            active
                                ? "secondary"
                                : "ghost"
                        }
                        size="sm"
                        onClick={() =>
                            onChange(
                                workspace.id,
                            )
                        }
                        className="gap-1.5"
                    >
                        <Icon className="h-3.5 w-3.5" />

                        <span className="text-xs">
                            {workspace.label}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}