'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { MASCOT_SPRITE_FRAMES, preloadMascotSprites, type MascotDirection } from './mascotSprites';
import {
  clearPendingTrailMascotMovement,
  readPendingTrailMascotMovement,
} from './trailMascotProgress';
import { createSmoothTrailPath, type SmoothTrailPath, type TrailPoint } from './trailPath';

const WALK_SPEED_PX_PER_SECOND = 116;
const FRAME_DURATION_MS = 110;
const START_DELAY_MS = 300;
const LOOK_AHEAD_DISTANCE = 10;
const DIRECTION_THRESHOLD = 1.2;
const CAMERA_UPDATE_INTERVAL_MS = 190;
const MAX_DELTA_SECONDS = 0.05;

interface TrailNodeLayout {
  element: HTMLElement;
  key: string;
  point: TrailPoint;
  waypointIndex: number;
}

interface TrailLayout {
  waypoints: Array<{ element: HTMLElement; point: TrailPoint }>;
  nodes: TrailNodeLayout[];
  nodeByKey: Map<string, TrailNodeLayout>;
}

interface MovementLeg {
  fromKey: string;
  toKey: string;
  targetElement: HTMLElement;
  path: SmoothTrailPath;
}

interface UseTrailMascotOptions {
  containerRef: RefObject<HTMLElement | null>;
  positionRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  progressKey: string;
  currentNodeKey: string;
}

function centerInContainer(element: HTMLElement, containerRect: DOMRect): TrailPoint {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2,
  };
}

function readTrailLayout(container: HTMLElement): TrailLayout {
  const containerRect = container.getBoundingClientRect();
  const waypointElements = Array.from(
    container.querySelectorAll<HTMLElement>('[data-trail-waypoint="true"]')
  );
  const waypoints = waypointElements.map((element) => ({
    element,
    point: centerInContainer(element, containerRect),
  }));
  const waypointIndexByElement = new Map(
    waypointElements.map((element, index) => [element, index] as const)
  );
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>('[data-trail-mascot-node]')
  ).flatMap((element) => {
    const key = element.dataset.trailMascotNode;
    const waypointIndex = waypointIndexByElement.get(element);
    if (!key || waypointIndex === undefined) return [];
    return [
      {
        element,
        key,
        point: centerInContainer(element, containerRect),
        waypointIndex,
      },
    ];
  });

  return {
    waypoints,
    nodes,
    nodeByKey: new Map(nodes.map((node) => [node.key, node])),
  };
}

function readLocallyCompletedLessons() {
  const completed = new Set<string>();

  try {
    const saved = JSON.parse(window.localStorage.getItem('stacklyst-completed-lessons') || '[]');
    if (Array.isArray(saved)) {
      saved.forEach((value) => {
        if (typeof value === 'string') completed.add(value);
      });
    }
  } catch {
    // The server-derived completion markers remain the source of truth.
  }

  return completed;
}

function resolveCurrentNodeKey(layout: TrailLayout, fallbackKey: string) {
  const locallyCompleted = readLocallyCompletedLessons();
  const current = layout.nodes.find(
    (node) =>
      node.element.dataset.trailMascotCompleted !== 'true' && !locallyCompleted.has(node.key)
  );
  return current?.key ?? layout.nodes.at(-1)?.key ?? fallbackKey;
}

function createMovementLeg(
  layout: TrailLayout,
  fromKey: string,
  toKey: string,
  startingPoint?: TrailPoint
): MovementLeg | null {
  const from = layout.nodeByKey.get(fromKey);
  const to = layout.nodeByKey.get(toKey);
  if (!from || !to || to.waypointIndex <= from.waypointIndex) return null;

  let points = layout.waypoints
    .slice(from.waypointIndex, to.waypointIndex + 1)
    .map((waypoint) => waypoint.point);

  if (startingPoint) {
    const remaining = points.slice(1).filter((point, index, candidates) => {
      const isDestination = index === candidates.length - 1;
      return isDestination || point.y > startingPoint.y + 3;
    });
    points = [startingPoint, ...remaining];
  }

  if (points.length < 2) points = [startingPoint ?? from.point, to.point];

  return {
    fromKey,
    toKey,
    targetElement: to.element,
    path: createSmoothTrailPath(points),
  };
}

function applyPosition(element: HTMLElement, point: TrailPoint) {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -88%)`;
}

function setSprite(image: HTMLImageElement, direction: MascotDirection, frameIndex: number) {
  const frames = MASCOT_SPRITE_FRAMES[direction];
  const source = frames[frameIndex % frames.length]!;
  if (!image.src.endsWith(source)) image.src = source;
}

function isHorizontal(direction: MascotDirection) {
  return direction === 'direita' || direction === 'esquerda';
}

export function chooseMascotDirection(
  dx: number,
  dy: number,
  currentDirection: MascotDirection
): MascotDirection {
  const horizontalMagnitude = Math.abs(dx);
  const verticalMagnitude = Math.abs(dy);
  if (horizontalMagnitude + verticalMagnitude < 0.25) return currentDirection;

  if (isHorizontal(currentDirection)) {
    if (verticalMagnitude > horizontalMagnitude * DIRECTION_THRESHOLD) {
      return dy >= 0 ? 'baixo' : 'cima';
    }
    return dx >= 0 ? 'direita' : 'esquerda';
  }

  if (horizontalMagnitude > verticalMagnitude * DIRECTION_THRESHOLD) {
    return dx >= 0 ? 'direita' : 'esquerda';
  }
  return dy >= 0 ? 'baixo' : 'cima';
}

function findScrollableAncestor(element: HTMLElement) {
  let parent = element.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (/(auto|scroll)/.test(overflowY) && parent.scrollHeight > parent.clientHeight) return parent;
    parent = parent.parentElement;
  }
  return null;
}

function followMascotWithCamera(element: HTMLElement, scrollContainer: HTMLElement | null) {
  const mascotRect = element.getBoundingClientRect();
  const viewportRect = scrollContainer?.getBoundingClientRect();
  const top = viewportRect?.top ?? 0;
  const height = viewportRect?.height ?? window.innerHeight;
  const upperLimit = top + height * 0.22;
  const lowerLimit = top + height * 0.78;
  const footY = mascotRect.top + mascotRect.height * 0.88;
  let delta = 0;

  if (footY > lowerLimit) delta = Math.min(96, footY - lowerLimit);
  else if (footY < upperLimit) delta = Math.max(-96, footY - upperLimit);
  if (Math.abs(delta) < 1) return;

  if (scrollContainer) scrollContainer.scrollBy({ top: delta, behavior: 'smooth' });
  else window.scrollBy({ top: delta, behavior: 'smooth' });
}

function playArrivalEffect(image: HTMLImageElement, target: HTMLElement) {
  image.animate?.(
    [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)', offset: 0.45 },
      { transform: 'translateY(0)' },
    ],
    { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
  );
  target.animate?.([{ scale: '1' }, { scale: '1.06', offset: 0.45 }, { scale: '1' }], {
    duration: 300,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  });
}

export function useTrailMascot({
  containerRef,
  positionRef,
  imageRef,
  progressKey,
  currentNodeKey,
}: UseTrailMascotOptions) {
  const settledNodeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const positionElement = positionRef.current;
    const image = imageRef.current;
    if (!container || !positionElement || !image || !currentNodeKey) return;

    let cancelled = false;
    let animationFrame = 0;
    let layoutDirty = false;
    let moving = false;
    const resizeObserver = new ResizeObserver(() => {
      layoutDirty = true;
      if (!moving) {
        const layout = readTrailLayout(container);
        const targetKey = resolveCurrentNodeKey(layout, currentNodeKey);
        const target = layout.nodeByKey.get(targetKey);
        if (target) applyPosition(positionElement, target.point);
      }
    });
    resizeObserver.observe(container);

    const handleWindowResize = () => {
      layoutDirty = true;
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });

    const layout = readTrailLayout(container);
    const targetKey = resolveCurrentNodeKey(layout, currentNodeKey);
    const target = layout.nodeByKey.get(targetKey);
    if (!target) {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      return;
    }

    const pending = readPendingTrailMascotMovement(progressKey);
    const previousSettledKey = settledNodeKeyRef.current;
    const fromKey =
      pending?.fromNodeKey && layout.nodeByKey.has(pending.fromNodeKey)
        ? pending.fromNodeKey
        : previousSettledKey && layout.nodeByKey.has(previousSettledKey)
          ? previousSettledKey
          : targetKey;
    const fromIndex = layout.nodes.findIndex((node) => node.key === fromKey);
    const targetIndex = layout.nodes.findIndex((node) => node.key === targetKey);
    const shouldAnimate = fromIndex >= 0 && targetIndex > fromIndex;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (!shouldAnimate || reduceMotion) {
      applyPosition(positionElement, target.point);
      positionElement.style.opacity = '1';
      positionElement.style.willChange = 'auto';
      setSprite(image, 'baixo', 0);
      settledNodeKeyRef.current = targetKey;
      if (pending) clearPendingTrailMascotMovement();
    } else {
      const start = layout.nodeByKey.get(fromKey)!;
      applyPosition(positionElement, start.point);
      positionElement.style.opacity = '1';
      positionElement.style.willChange = 'transform';

      const destinationKeys = layout.nodes
        .slice(fromIndex + 1, targetIndex + 1)
        .map((node) => node.key);
      let legFromKey = fromKey;
      let legIndex = 0;
      let leg = createMovementLeg(layout, legFromKey, destinationKeys[legIndex]!);
      let distance = 0;
      let elapsedForSprites = 0;
      let direction: MascotDirection = 'baixo';
      let lastTime = 0;
      let delayRemaining = START_DELAY_MS;
      let lastCameraUpdate = 0;
      let currentPoint = start.point;
      const scrollContainer = findScrollableAncestor(container);

      const finish = () => {
        const finalLayout = readTrailLayout(container);
        const finalTarget = finalLayout.nodeByKey.get(targetKey);
        if (finalTarget) {
          currentPoint = finalTarget.point;
          applyPosition(positionElement, currentPoint);
          playArrivalEffect(image, finalTarget.element);
        }
        moving = false;
        positionElement.style.willChange = 'auto';
        setSprite(image, direction, 0);
        settledNodeKeyRef.current = targetKey;
        clearPendingTrailMascotMovement();
      };

      const advanceToNextLeg = () => {
        if (!leg) return false;
        legFromKey = leg.toKey;
        legIndex += 1;
        distance = 0;
        if (legIndex >= destinationKeys.length) {
          finish();
          return false;
        }
        const nextLayout = readTrailLayout(container);
        leg = createMovementLeg(nextLayout, legFromKey, destinationKeys[legIndex]!);
        return Boolean(leg);
      };

      const animate = (time: number) => {
        if (cancelled || !leg) return;
        moving = true;
        if (lastTime === 0) lastTime = time;
        const deltaMs = time - lastTime;
        const deltaSeconds = Math.min(MAX_DELTA_SECONDS, Math.max(0, deltaMs / 1000));
        lastTime = time;

        if (delayRemaining > 0) {
          delayRemaining -= deltaMs;
          animationFrame = requestAnimationFrame(animate);
          return;
        }

        if (layoutDirty) {
          const nextLayout = readTrailLayout(container);
          leg = createMovementLeg(nextLayout, legFromKey, leg.toKey, currentPoint) ?? leg;
          distance = 0;
          layoutDirty = false;
        }

        distance += WALK_SPEED_PX_PER_SECOND * deltaSeconds;
        elapsedForSprites += deltaMs;

        while (leg && distance >= leg.path.totalLength) {
          currentPoint = leg.path.getPointAtLength(leg.path.totalLength);
          applyPosition(positionElement, currentPoint);
          if (!advanceToNextLeg()) return;
        }

        if (!leg) return;
        currentPoint = leg.path.getPointAtLength(distance);
        const lookAhead = leg.path.getPointAtLength(
          Math.min(leg.path.totalLength, distance + LOOK_AHEAD_DISTANCE)
        );
        direction = chooseMascotDirection(
          lookAhead.x - currentPoint.x,
          lookAhead.y - currentPoint.y,
          direction
        );
        const frameIndex = Math.floor(elapsedForSprites / FRAME_DURATION_MS);
        setSprite(image, direction, frameIndex);
        applyPosition(positionElement, currentPoint);

        if (time - lastCameraUpdate >= CAMERA_UPDATE_INTERVAL_MS) {
          followMascotWithCamera(positionElement, scrollContainer);
          lastCameraUpdate = time;
        }

        animationFrame = requestAnimationFrame(animate);
      };

      void preloadMascotSprites().then(() => {
        if (!cancelled && leg) animationFrame = requestAnimationFrame(animate);
      });
    }

    return () => {
      cancelled = true;
      moving = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [containerRef, currentNodeKey, imageRef, positionRef, progressKey]);
}
