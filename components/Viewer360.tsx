"use client";

import Viewer360AdminLegacy from "@/components/Viewer360AdminLegacy";

type HotspotType =
  | "nav"
  | "stairs-up"
  | "stairs-down"
  | "terrace"
  | "room"
  | "amenity"
  | "kitchen"
  | "living"
  | "bedroom"
  | "bathroom"
  | "pool"
  | "beach"
  | "view"
  | "garden"
  | "parking"
  | "elevator"
  | "gym"
  | "spa"
  | "lobby"
  | "dining";

type HotspotSize = "sm" | "md" | "lg";

type Hotspot360 = {
  id: string;
  pitch: number;
  yaw: number;
  label?: string;
  targetSceneId?: string;
  type?: HotspotType;
  size?: HotspotSize;
};

type Viewer360Props = {
  image: string;
  hotspots?: Hotspot360[];
  onHotspotClick?: (targetSceneId?: string, hotspot?: Hotspot360) => void;
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
  transitionOnHotspot?: boolean;
  onReady?: () => void;
};

export default function Viewer360({
  image,
  hotspots = [],
  onHotspotClick,
  editable = false,
  onSceneClick,
  transitionOnHotspot = false,
  initialYaw = 0,
  initialPitch = 0,
  onViewChange,
  onReady,
}: Viewer360Props) {
  return (
    <div
      className="h-full w-full touch-none overscroll-none"
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
    >
      <Viewer360AdminLegacy
        image={image}
        hotspots={hotspots}
        onHotspotClick={onHotspotClick}
        transitionOnHotspot={transitionOnHotspot}
        editable={editable}
        onSceneClick={onSceneClick}
        initialYaw={initialYaw}
        initialPitch={initialPitch}
        onViewChange={onViewChange}
        onReady={onReady}
      />
    </div>
  );
}
