import { useMemo } from 'react';
import { PanResponder } from 'react-native';

interface UseLeftEdgeSwipeToOpenOptions {
  onOpen: () => void;
  isDisabled?: boolean;
  edgeWidth?: number;
  minDistance?: number;
  minVelocity?: number;
}

const DEFAULT_EDGE_WIDTH = 24;
const DEFAULT_MIN_DISTANCE = 50;
const DEFAULT_MIN_VELOCITY = 0.3;

export function useLeftEdgeSwipeToOpen({
  onOpen,
  isDisabled = false,
  edgeWidth = DEFAULT_EDGE_WIDTH,
  minDistance = DEFAULT_MIN_DISTANCE,
  minVelocity = DEFAULT_MIN_VELOCITY,
}: UseLeftEdgeSwipeToOpenOptions) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => {
          if (isDisabled) {
            return false;
          }

          const startedFromLeftEdge = gestureState.x0 <= edgeWidth;
          const movedRight = gestureState.dx > 10;
          const movedMostlyHorizontally =
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;

          return startedFromLeftEdge && movedRight && movedMostlyHorizontally;
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (isDisabled) {
            return;
          }

          const movedFarEnough = gestureState.dx >= minDistance;
          const movedFastEnough = gestureState.vx >= minVelocity;
          const movedMostlyHorizontally =
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

          if (
            (movedFarEnough || movedFastEnough) &&
            movedMostlyHorizontally &&
            gestureState.dx > 0
          ) {
            onOpen();
          }
        },
      }),
    [edgeWidth, isDisabled, minDistance, minVelocity, onOpen],
  );

  return panResponder.panHandlers;
}
