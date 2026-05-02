import { describe, expect, test } from "vitest";

import {
  buildWallSegmentsForPose,
  getPoseSilhouetteBounds,
  WALL_GEOMETRY,
} from "@/lib/pose-geometry";
import type { RectBounds, WallSegment } from "@/lib/pose-geometry";

const EPSILON = 0.0001;

const overlapsX = (left: RectBounds, right: RectBounds): boolean =>
  left.maxX > right.minX + EPSILON && left.minX < right.maxX - EPSILON;

const intersectsRect = (segment: WallSegment, hole: RectBounds): boolean => {
  const segmentRect: RectBounds = {
    maxX: segment.x + segment.width / 2,
    maxY: segment.y + segment.height / 2,
    minX: segment.x - segment.width / 2,
    minY: segment.y - segment.height / 2,
  };

  return (
    segmentRect.maxX > hole.minX + EPSILON &&
    segmentRect.minX < hole.maxX - EPSILON &&
    segmentRect.maxY > hole.minY + EPSILON &&
    segmentRect.minY < hole.maxY - EPSILON
  );
};

const rectCenterY = (rect: RectBounds): number => (rect.minY + rect.maxY) / 2;

describe("pose geometry", () => {
  const poses = [
    { leftArm: "out", rightArm: "out" },
    { leftArm: "out", rightArm: "tucked" },
    { leftArm: "tucked", rightArm: "out" },
    { leftArm: "tucked", rightArm: "tucked" },
  ] as const;

  test("tucked lowers arm center y for both sides", () => {
    const bothOut = getPoseSilhouetteBounds({ leftArm: "out", rightArm: "out" });
    const bothTucked = getPoseSilhouetteBounds({ leftArm: "tucked", rightArm: "tucked" });

    expect(rectCenterY(bothTucked.leftArm)).toBeLessThan(rectCenterY(bothOut.leftArm));
    expect(rectCenterY(bothTucked.rightArm)).toBeLessThan(rectCenterY(bothOut.rightArm));
  });

  test("tucked arms stay on their expected sides", () => {
    const tucked = getPoseSilhouetteBounds({ leftArm: "tucked", rightArm: "tucked" });

    expect(tucked.leftArm.maxX).toBeLessThanOrEqual(0.25);
    expect(tucked.rightArm.minX).toBeGreaterThanOrEqual(-0.25);
  });

  test("body silhouette always contains body core vertical range", () => {
    const { body } = getPoseSilhouetteBounds({ leftArm: "tucked", rightArm: "tucked" });

    expect(body.minY).toBeLessThanOrEqual(0.6);
    expect(body.maxY).toBeGreaterThanOrEqual(5.05);
  });

  test("generated segments do not overlap with hole bounds for all poses", () => {
    for (const pose of poses) {
      const hole = getPoseSilhouetteBounds(pose);
      const segments = buildWallSegmentsForPose(pose);
      const holeRects = [hole.body, hole.leftArm, hole.rightArm];

      for (const segment of segments) {
        for (const holeRect of holeRects) {
          expect(intersectsRect(segment, holeRect)).toBe(false);
        }
      }
    }
  });

  test("generated segments are non-overlapping except edge-touch", () => {
    const segments = buildWallSegmentsForPose({ leftArm: "out", rightArm: "out" });

    for (let leftIndex = 0; leftIndex < segments.length; leftIndex += 1) {
      const left = segments[leftIndex];
      if (!left) {
        continue;
      }

      const leftRect: RectBounds = {
        maxX: left.x + left.width / 2,
        maxY: left.y + left.height / 2,
        minX: left.x - left.width / 2,
        minY: left.y - left.height / 2,
      };

      for (let rightIndex = leftIndex + 1; rightIndex < segments.length; rightIndex += 1) {
        const right = segments[rightIndex];
        if (!right) {
          continue;
        }

        const rightRect: RectBounds = {
          maxX: right.x + right.width / 2,
          maxY: right.y + right.height / 2,
          minX: right.x - right.width / 2,
          minY: right.y - right.height / 2,
        };

        const xOverlap = overlapsX(leftRect, rightRect);
        const yOverlap =
          leftRect.maxY > rightRect.minY + EPSILON && leftRect.minY < rightRect.maxY - EPSILON;

        expect(!(xOverlap && yOverlap)).toBe(true);
      }
    }
  });

  test("segments stay inside wall frame", () => {
    const segments = buildWallSegmentsForPose({ leftArm: "out", rightArm: "tucked" });

    for (const segment of segments) {
      const minX = segment.x - segment.width / 2;
      const maxX = segment.x + segment.width / 2;
      const minY = segment.y - segment.height / 2;
      const maxY = segment.y + segment.height / 2;

      expect(minX).toBeGreaterThanOrEqual(-WALL_GEOMETRY.frameHalfWidth - EPSILON);
      expect(maxX).toBeLessThanOrEqual(WALL_GEOMETRY.frameHalfWidth + EPSILON);
      expect(minY).toBeGreaterThanOrEqual(-EPSILON);
      expect(maxY).toBeLessThanOrEqual(WALL_GEOMETRY.height + EPSILON);
    }
  });
});
