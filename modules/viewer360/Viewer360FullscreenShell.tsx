"use client";

import type { ReactNode } from "react";
import type { Viewer360Rect, Viewer360FullscreenState } from "./Viewer360.types";

type Viewer360FullscreenShellProps = {
  mounted: boolean;
  visible: boolean;
  originRect: Viewer360Rect | null;
  viewport: Viewer360FullscreenState | null;
  onClose?: () => void;
  children: ReactNode;
};

export default function Viewer360FullscreenShell({
  mounted,
  children,
}: Viewer360FullscreenShellProps) {
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
}
