import type { ArmState } from "@/types/game";

export interface RectBounds {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

export interface WallSegment {
  depth: number;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface PoseShape {
  leftArm: ArmState;
  rightArm: ArmState;
}

interface ArmGeometry {
  length: number;
  pivotXOffset: number;
  pivotY: number;
  thickness: number;
  tuckedRotation: number;
}

interface BoxGeometry {
  height: number;
  width: number;
  x: number;
  y: number;
  z: number;
}

interface CharacterGeometry {
  arm: ArmGeometry;
  head: BoxGeometry;
  hips: BoxGeometry;
  torso: BoxGeometry;
}

interface WallGeometry {
  depth: number;
  frameHalfWidth: number;
  height: number;
  laneCenterX: number;
  minimumSegmentWidth: number;
  silhouettePadding: number;
}

export const CHARACTER_GEOMETRY: CharacterGeometry = {
  arm: {
    length: 1.1,
    pivotXOffset: 1,
    pivotY: 3.9,
    thickness: 0.28,
    tuckedRotation: Math.PI / 2.5,
  },
  head: {
    height: 0.9,
    width: 0.9,
    x: 0,
    y: 4.6,
    z: 0,
  },
  hips: {
    height: 1.8,
    width: 1.2,
    x: 0,
    y: 1.5,
    z: 0,
  },
  torso: {
    height: 1.8,
    width: 1.4,
    x: 0,
    y: 3.2,
    z: 0,
  },
};

export const WALL_GEOMETRY: WallGeometry = {
  depth: 2,
  frameHalfWidth: 3,
  height: 9,
  laneCenterX: 0,
  minimumSegmentWidth: 0.04,
  silhouettePadding: 0.06,
};

const EPSILON = 0.0001;

const createRect = (minX: number, maxX: number, minY: number, maxY: number): RectBounds => ({
  maxX,
  maxY,
  minX,
  minY,
});

const padRect = (rect: RectBounds, padding: number): RectBounds =>
  createRect(rect.minX - padding, rect.maxX + padding, rect.minY - padding, rect.maxY + padding);

const rectFromBox = (box: BoxGeometry): RectBounds => {
  const halfHeight = box.height / 2;
  const halfWidth = box.width / 2;

  return createRect(box.x - halfWidth, box.x + halfWidth, box.y - halfHeight, box.y + halfHeight);
};

const mergeRects = (rects: RectBounds[]): RectBounds => {
  const maxX = Math.max(...rects.map((rect) => rect.maxX));
  const maxY = Math.max(...rects.map((rect) => rect.maxY));
  const minX = Math.min(...rects.map((rect) => rect.minX));
  const minY = Math.min(...rects.map((rect) => rect.minY));

  return createRect(minX, maxX, minY, maxY);
};

const getRotatedArmBounds = (side: "left" | "right", state: ArmState): RectBounds => {
  const direction = side === "left" ? -1 : 1;
  const armCenterOffsetX = direction * CHARACTER_GEOMETRY.arm.length * 0.5;
  const localCenterX = armCenterOffsetX;
  const localCenterY = 0;
  const halfHeight = CHARACTER_GEOMETRY.arm.thickness / 2;
  const halfWidth = CHARACTER_GEOMETRY.arm.length / 2;

  const localCorners: [number, number][] = [
    [localCenterX - halfWidth, localCenterY - halfHeight],
    [localCenterX - halfWidth, localCenterY + halfHeight],
    [localCenterX + halfWidth, localCenterY - halfHeight],
    [localCenterX + halfWidth, localCenterY + halfHeight],
  ];

  const rotationSign = side === "left" ? -1 : 1;
  const angle = state === "out" ? 0 : rotationSign * CHARACTER_GEOMETRY.arm.tuckedRotation;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const pivotX = direction * CHARACTER_GEOMETRY.arm.pivotXOffset;
  const { pivotY } = CHARACTER_GEOMETRY.arm;

  const worldPoints = localCorners.map(([x, y]) => {
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;

    return [pivotX + rotatedX, pivotY + rotatedY] as const;
  });

  const maxX = Math.max(...worldPoints.map(([x]) => x));
  const maxY = Math.max(...worldPoints.map(([, y]) => y));
  const minX = Math.min(...worldPoints.map(([x]) => x));
  const minY = Math.min(...worldPoints.map(([, y]) => y));

  return createRect(minX, maxX, minY, maxY);
};

const intersectsX = (rect: RectBounds, minX: number, maxX: number): boolean =>
  rect.maxX > minX + EPSILON && rect.minX < maxX - EPSILON;

const mergeIntervals = (intervals: [number, number][]): [number, number][] => {
  if (intervals.length === 0) {
    return [];
  }

  const sorted = [...intervals].toSorted((left, right) => left[0] - right[0]);
  const merged: [number, number][] = [sorted[0] ?? [0, 0]];

  for (const interval of sorted.slice(1)) {
    const last = merged.at(-1);
    if (!last) {
      continue;
    }

    if (interval[0] <= last[1] + EPSILON) {
      last[1] = Math.max(last[1], interval[1]);
      continue;
    }

    merged.push([interval[0], interval[1]]);
  }

  return merged;
};

const toSegment = (minX: number, maxX: number, minY: number, maxY: number): WallSegment | null => {
  const height = maxY - minY;
  const width = maxX - minX;

  if (height <= EPSILON || width <= EPSILON) {
    return null;
  }

  return {
    depth: WALL_GEOMETRY.depth,
    height,
    width,
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

export const getPoseSilhouetteBounds = (
  pose: PoseShape,
): { body: RectBounds; leftArm: RectBounds; rightArm: RectBounds } => {
  const bodyCore = mergeRects([
    rectFromBox(CHARACTER_GEOMETRY.hips),
    rectFromBox(CHARACTER_GEOMETRY.torso),
    rectFromBox(CHARACTER_GEOMETRY.head),
  ]);

  const body = padRect(bodyCore, WALL_GEOMETRY.silhouettePadding);
  const leftArm = padRect(
    getRotatedArmBounds("left", pose.leftArm),
    WALL_GEOMETRY.silhouettePadding,
  );
  const rightArm = padRect(
    getRotatedArmBounds("right", pose.rightArm),
    WALL_GEOMETRY.silhouettePadding,
  );

  return {
    body,
    leftArm,
    rightArm,
  };
};

export const buildWallSegmentsForPose = (pose: PoseShape): WallSegment[] => {
  const { body, leftArm, rightArm } = getPoseSilhouetteBounds(pose);
  const frameMinX = WALL_GEOMETRY.laneCenterX - WALL_GEOMETRY.frameHalfWidth;
  const frameMaxX = WALL_GEOMETRY.laneCenterX + WALL_GEOMETRY.frameHalfWidth;
  const frameMinY = 0;
  const frameMaxY = WALL_GEOMETRY.height;

  const holeRects = [body, leftArm, rightArm].map((rect) =>
    createRect(
      Math.max(frameMinX, rect.minX),
      Math.min(frameMaxX, rect.maxX),
      Math.max(frameMinY, rect.minY),
      Math.min(frameMaxY, rect.maxY),
    ),
  );

  const xBreaks = [frameMinX, ...holeRects.flatMap((rect) => [rect.minX, rect.maxX]), frameMaxX]
    .filter((value) => value >= frameMinX - EPSILON && value <= frameMaxX + EPSILON)
    .toSorted((left, right) => left - right)
    .filter((value, index, array) =>
      index === 0 ? true : Math.abs(value - array[index - 1]) > EPSILON,
    );

  const segments: WallSegment[] = [];

  for (let index = 0; index < xBreaks.length - 1; index += 1) {
    const stripMinX = xBreaks[index] ?? frameMinX;
    const stripMaxX = xBreaks[index + 1] ?? frameMaxX;

    if (stripMaxX - stripMinX < WALL_GEOMETRY.minimumSegmentWidth) {
      continue;
    }

    const intervals = holeRects
      .filter((rect) => intersectsX(rect, stripMinX, stripMaxX))
      .map((rect) => [rect.minY, rect.maxY] as [number, number]);

    const mergedHoleIntervals = mergeIntervals(intervals);
    let cursorY = frameMinY;

    for (const [holeMinY, holeMaxY] of mergedHoleIntervals) {
      const lowerSegment = toSegment(stripMinX, stripMaxX, cursorY, holeMinY);
      if (lowerSegment) {
        segments.push(lowerSegment);
      }
      cursorY = Math.max(cursorY, holeMaxY);
    }

    const upperSegment = toSegment(stripMinX, stripMaxX, cursorY, frameMaxY);
    if (upperSegment) {
      segments.push(upperSegment);
    }
  }

  return segments;
};
