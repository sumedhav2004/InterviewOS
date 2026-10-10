"use client";

import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { InterviewWorkspaceType } from "../types/interview";



type InterviewRoomContextValue = {
    workspace: InterviewWorkspaceType;
    setWorkspace: (
        workspace: InterviewWorkspaceType,
    ) => void;
};

const InterviewRoomContext =
    createContext<
        InterviewRoomContextValue | undefined
    >(undefined);

export function InterviewRoomProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [workspace, setWorkspace] =
        useState<InterviewWorkspaceType>("CODE");

    return (
        <InterviewRoomContext.Provider
            value={{
                workspace,
                setWorkspace,
            }}
        >
            {children}
        </InterviewRoomContext.Provider>
    );
}

export function useInterviewRoom() {
    const context =
        useContext(
            InterviewRoomContext,
        );

    if (!context) {
        throw new Error(
            "useInterviewRoom must be used inside InterviewRoomProvider",
        );
    }

    return context;
}