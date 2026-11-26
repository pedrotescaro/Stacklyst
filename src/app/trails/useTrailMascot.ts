'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { MascotDirection } from './mascotSprites';
import {
  clearPendingTrailMascotMovement,
  readPendingTrailMascotMovement,
} from './trailMascotProgress';
import type { SmoothTrailPath, TrailPoint } from './trailPath';
import {
  buildMascotRoute,
  mascotStandPoint,
  type MascotNodeBox,
  type MascotSpriteSize,
} from './trailMascotRoute';

const WALK_SPEED_PX_PER_SECOND = 140;
/** Long routes (several rows, or across a unit) speed up instead of dragging on. */
const MAX_WALK_SECONDS = 3.2;
const START_DELAY_MS = 300;
const LOOK_AHEAD_DISTANCE = 10;
const DIRECTION_THRESHOLD = 1.2;
const CAMERA_UPDATE_INTERVAL_MS = 190;
const MAX_DELTA_SECONDS = 0.05;
/** How often a standing mascot checks whether a dialog now covers it. */
const OBSCURED_CHECK_MS = 300;

/** Which way the hero faces and whether it is walking; the sprite animates each pose itself. */
export interface MascotPose {
  direction: MascotDirection;
  walking: boolean;
}

interface TrailNodeLayout {
  element: HTMLElement;
  key: string;
  point: TrailPoint;
  waypointIndex: number;
}

interface TrailLayout {
  waypoints: Array<{ element: HTMLElement; box: MascotNodeBox }>;
  nodes: TrailNodeLayout[];
  nodeByKey: Map<string, TrailNodeLayout>;
  sprite: MascotSpriteSize;
}

interface UseTrailMascotOptions {
  containerRef: RefObject<HTMLElement | null>;
  positionRef: RefObject<HTMLDivElement | null>;
  /** The drawn hero, bounced on arrival. */
  spriteRef: RefObject<HTMLElement | null>;
  onPoseChange: (pose: MascotPose) => void;
  progressKey: string;
  currentNodeKey: string;
}

function boxInContainer(element: HTMLElement, containerRect: DOMRect): MascotNodeBox {
  const rect = element.getBoundingClientRect();
  const side = element.closest('[data-side]')?.getAttribute('data-side');
  return {
    cx: rect.left - containerRect.left + rect.width / 2,
    cy: rect.top - containerRect.top + rect.height / 2,
    halfWidth: rect.width / 2,
    halfHeight: rect.height / 2,
    side: side === 'left' || side === 'right' ? side : null,
  };
}

function readSpriteSize(container: HTMLElement, firstNode?: HTMLElement): MascotSpriteSize {
  const mascot = container.querySelector<HTMLElement>('[data-testid="trail-moving-mascot"]');
  // offsetWidth/Height ignore the transform, so the size is right mid-walk too.
  const width = mascot?.offsetWidth || 76;
  const height = mascot?.offsetHeight || 76;
  const gap = firstNode
    ? Number.parseFloat(getComputedStyle(firstNode).getPropertyValue('--trail-mascot-gap')) || 8
    : 8;
  return { width, height, gap };
}

function readTrailLayout(container: HTMLElement): TrailLayout {
  const containerRect = container.getBoundingClientRect();
  const waypointElements = Array.from(
    container.querySelectorAll<HTMLElement>('[data-trail-waypoint="true"]')
  );
  const sprite = readSpriteSize(container, waypointElements[0]);
  const waypoints = waypointElements.map((element) => ({
    element,
    box: boxInContainer(element, containerRect),
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
        point: mascotStandPoint(waypoints[waypointIndex]!.box, sprite),
        waypointIndex,
      },
    ];
  });

  return {
    waypoints,
    nodes,
    nodeByKey: new Map(nodes.map((node) => [node.key, node])),
    sprite,
  };
}

function resolveCurrentNodeKey(layout: TrailLayout, fallbackKey: string) {
  if (layout.nodeByKey.has(fallbackKey)) return fallbackKey;
  const current = layout.nodes.find((node) => node.element.dataset.trailMascotCompleted !== 'true');
  return current?.key ?? layout.nodes.at(-1)?.key ?? fallbackKey;
}

/** One continuous route through every waypoint (bosses included) between two nodes. */
function createRoute(layout: TrailLayout, fromKey: string, toKey: string): SmoothTrailPath | null {
  const from = layout.nodeByKey.get(fromKey);
  const to = layout.nodeByKey.get(toKey);
  if (!from || !to || to.waypointIndex <= from.waypointIndex) return null;
  const boxes = layout.waypoints
    .slice(from.waypointIndex, to.waypointIndex + 1)
    .map((waypoint) => waypoint.box);
  return buildMascotRoute(boxes, layout.sprite);
}

function applyPosition(element: HTMLElement, point: TrailPoint) {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -88%)`;
}

function isHorizontal(direction: MascotDirection) {
  return direction === 'direita' || direction === 'esquerda';
}

export function resolveMascotMovementRange(
  nodeKeys: readonly string[],
  requestedFromKey: string,
  targetKey: string,
  replaySameNode: boolean
) {
  let fromIndex = nodeKeys.indexOf(requestedFromKey);
  const targetIndex = nodeKeys.indexOf(targetKey);

  if (replaySameNode && fromIndex === targetIndex && targetIndex > 0) {
    fromIndex = targetIndex - 1;
  }

  return { fromIndex, targetIndex };
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

function playArrivalEffect(sprite: HTMLElement, target: HTMLElement) {
  sprite.animate?.(
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
  spriteRef,
  onPoseChange,
  progressKey,
  currentNodeKey,
}: UseTrailMascotOptions) {
  const settledNodeKeyRef = useRef<string | null>(null);
  const poseRef = useRef(onPoseChange);
  poseRef.current = onPoseChange;

  useEffect(() => {
    const container = containerRef.current;
    const positionElement = positionRef.current;
    const sprite = spriteRef.current;
    if (!container || !positionElement || !sprite || !currentNodeKey) return;
    // The walk loop asks every frame; the page hears only actual turns and stops.
    let lastPose = '';
    const setPose = (direction: MascotDirection, moving: boolean) => {
      const key = `${direction}:${moving}`;
      if (key === lastPose) return;
      lastPose = key;
      poseRef.current({ direction, walking: moving });
    };

    let cancelled = false;
    let animationFrame = 0;
    let idleInterval: number | null = null;
    let layoutDirty = false;
    // True from the moment a walk is scheduled until it settles, so layout
    // observers never snap the sprite to the destination before it walks.
    let walking = false;

    const isObscured = () =>
      document.hidden ||
      Boolean(document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]'));

    const stopIdleAnimation = () => {
      if (idleInterval !== null) {
        window.clearInterval(idleInterval);
        idleInterval = null;
      }
    };

    // Standing still the hero breathes on its own; this only hides it under dialogs.
    const startIdleAnimation = (direction: MascotDirection, reduceMotion: boolean) => {
      stopIdleAnimation();
      setPose(direction, false);
      if (reduceMotion) return;
      idleInterval = window.setInterval(() => {
        if (cancelled || walking) return;
        positionElement.style.visibility = isObscured() ? 'hidden' : 'visible';
      }, OBSCURED_CHECK_MS);
    };

    const snapToCurrentNode = () => {
      const layout = readTrailLayout(container);
      const target = layout.nodeByKey.get(resolveCurrentNodeKey(layout, currentNodeKey));
      if (!target) return;
      applyPosition(positionElement, target.point);
      positionElement.style.visibility = 'visible';
    };

    const resizeObserver = new ResizeObserver(() => {
      layoutDirty = true;
      if (!walking) snapToCurrentNode();
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
    let previousSettledKey = settledNodeKeyRef.current;
    try {
      previousSettledKey ??= sessionStorage.getItem(`mascot-position:${progressKey}`);
    } catch {
      /* Animation storage is optional, never learning state. */
    }
    const rememberPosition = () => {
      try {
        sessionStorage.setItem(`mascot-position:${progressKey}`, targetKey);
      } catch {
        /* Optional. */
      }
    };
    let fromKey =
      pending?.fromNodeKey && layout.nodeByKey.has(pending.fromNodeKey)
        ? pending.fromNodeKey
        : previousSettledKey && layout.nodeByKey.has(previousSettledKey)
          ? previousSettledKey
          : targetKey;
    const { fromIndex, targetIndex } = resolveMascotMovementRange(
      layout.nodes.map((node) => node.key),
      fromKey,
      targetKey,
      false
    );

    // Replay only a real advance reported by the server, never a same-node return.
    if (fromKey !== layout.nodes[fromIndex]?.key && fromIndex >= 0) {
      fromKey = layout.nodes[fromIndex]!.key;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let route =
      fromIndex >= 0 && targetIndex > fromIndex ? createRoute(layout, fromKey, targetKey) : null;

    if (!route || reduceMotion) {
      applyPosition(positionElement, target.point);
      positionElement.style.opacity = '1';
      positionElement.style.willChange = 'auto';
      positionElement.style.visibility = 'visible';
      startIdleAnimation('baixo', reduceMotion);
      settledNodeKeyRef.current = targetKey;
      rememberPosition();
      if (pending) clearPendingTrailMascotMovement();
    } else {
      walking = true;
      // Lets the page hide overlays the route passes through (the "next lesson" bubble).
      container.dataset.mascotWalking = 'true';
      stopIdleAnimation();
      let currentPoint = route.getPointAtLength(0);
      applyPosition(positionElement, currentPoint);
      setPose('baixo', true);
      positionElement.style.opacity = '1';
      positionElement.style.willChange = 'transform';

      let distance = 0;
      let direction: MascotDirection = 'baixo';
      let lastTime = 0;
      let delayRemaining = START_DELAY_MS;
      let lastCameraUpdate = 0;
      const scrollContainer = findScrollableAncestor(container);
      const speedFor = (path: SmoothTrailPath) =>
        Math.max(WALK_SPEED_PX_PER_SECOND, path.totalLength / MAX_WALK_SECONDS);
      let speed = speedFor(route);

      const finish = () => {
        walking = false;
        delete container.dataset.mascotWalking;
        const finalLayout = readTrailLayout(container);
        const finalTarget = finalLayout.nodeByKey.get(targetKey);
        if (finalTarget) {
          applyPosition(positionElement, finalTarget.point);
          playArrivalEffect(sprite, finalTarget.element);
        }
        positionElement.style.willChange = 'auto';
        positionElement.style.visibility = 'visible';
        // Arrived: turn to face the learner and breathe.
        startIdleAnimation('baixo', reduceMotion);
        settledNodeKeyRef.current = targetKey;
        rememberPosition();
        clearPendingTrailMascotMovement();
      };

      const animate = (time: number) => {
        if (cancelled || !route) return;
        if (isObscured()) {
          lastTime = time;
          positionElement.style.visibility = 'hidden';
          animationFrame = requestAnimationFrame(animate);
          return;
        }
        positionElement.style.visibility = 'visible';
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
          // Nodes moved (fonts, data, resize): rebuild the route on the new
          // layout and keep the same share of it already walked.
          layoutDirty = false;
          const progress = route.totalLength > 0 ? distance / route.totalLength : 1;
          const nextRoute = createRoute(readTrailLayout(container), fromKey, targetKey);
          if (nextRoute) {
            route = nextRoute;
            speed = speedFor(route);
            distance = progress * route.totalLength;
          }
        }

        distance += speed * deltaSeconds;

        if (distance >= route.totalLength) {
          finish();
          return;
        }

        currentPoint = route.getPointAtLength(distance);
        const lookAhead = route.getPointAtLength(
          Math.min(route.totalLength, distance + LOOK_AHEAD_DISTANCE)
        );
        direction = chooseMascotDirection(
          lookAhead.x - currentPoint.x,
          lookAhead.y - currentPoint.y,
          direction
        );
        setPose(direction, true);
        applyPosition(positionElement, currentPoint);

        if (time - lastCameraUpdate >= CAMERA_UPDATE_INTERVAL_MS) {
          followMascotWithCamera(positionElement, scrollContainer);
          lastCameraUpdate = time;
        }

        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelled = true;
      walking = false;
      delete container.dataset.mascotWalking;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      stopIdleAnimation();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [containerRef, currentNodeKey, spriteRef, positionRef, progressKey]);
}
