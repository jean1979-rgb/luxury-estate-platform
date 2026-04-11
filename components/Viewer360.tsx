"use client";

import Viewer360Core from "../modules/viewer360/Viewer360Core";
import type { Viewer360Hotspot } from "../modules/viewer360/Viewer360.types";

type HotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen";

type HotspotSize = "sm" | "md" | "lg";

type Hotspot360 = Viewer360Hotspot & {
  label?: string;
  targetSceneId?: string;
  type?: HotspotType;
  size?: HotspotSize;
};

type Viewer360Props = {
  image: string;
  hotspots?: Hotspot360[];
  onHotspotClick?: (targetSceneId?: string) => void;
  editable?: boolean;
  onSceneClick?: (coords: { yaw: number; pitch: number }) => void;
  initialYaw?: number;
  initialPitch?: number;
  initialFov?: number;
  minFov?: number;
  maxFov?: number;
  onViewChange?: (view: { yaw: number; pitch: number }) => void;
  interactive?: boolean;
  introEnabled?: boolean;
};

export default function Viewer360({
  image,
  hotspots = [],
  onHotspotClick,
  editable = false,
  onSceneClick,
  initialYaw = 0,
  initialPitch = 0,
  initialFov,
  minFov,
  maxFov,
  onViewChange,
  interactive = true,
  introEnabled = false,
}: Viewer360Props) {
  return (
    <div
      className="h-full w-full touch-none overscroll-none"
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
    >
      <Viewer360Core
        image={image}
        hotspots={hotspots}
        onHotspotClick={onHotspotClick}
        editable={editable}
        onSceneClick={onSceneClick}
        initialYaw={initialYaw}
        initialPitch={initialPitch}
        initialFov={initialFov}
        minFov={minFov}
        maxFov={maxFov}
        onViewChange={onViewChange}
        interactive={interactive}
        introEnabled={introEnabled}
      />
    </div>
  );
}
