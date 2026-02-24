import type {
  GetResponsiveStylesParams,
  GetResponsiveStylesReturnType,
} from './types';
import type { ScaledSize } from 'react-native';
import { Dimensions, StyleSheet } from 'react-native';
import React from 'react';

export const getResponsiveStylesImpl = (width: number) => (
  queries: GetResponsiveStylesParams
): GetResponsiveStylesReturnType => {
  if (typeof width === 'number') {
    let styles = queries.initial
      ? [
          StyleSheet.create({ initial: StyleSheet.flatten(queries.initial) })
            .initial,
        ]
      : [];

    if (queries.query) {
      queries.query.forEach((queryRule) => {
        if (queryRule.style) {
          const flattenQueryStyle = StyleSheet.flatten(queryRule.style);

          if (
            typeof queryRule.maxWidth === 'number' &&
            typeof queryRule.minWidth === 'number'
          ) {
            if (width >= queryRule.minWidth && width <= queryRule.maxWidth) {
              styles.push(
                StyleSheet.create({ rangeStyle: flattenQueryStyle }).rangeStyle
              );
            }
          } else if (typeof queryRule.minWidth === 'number') {
            if (width >= queryRule.minWidth) {
              styles.push(
                StyleSheet.create({ minWidthStyle: flattenQueryStyle })
                  .minWidthStyle
              );
            }
          } else if (typeof queryRule.maxWidth === 'number') {
            if (width <= queryRule.maxWidth) {
              styles.push(
                StyleSheet.create({ maxWidthStyle: flattenQueryStyle })
                  .maxWidthStyle
              );
            }
          }
        }
      });
      return { styles };
    }
  }

  return {};
};

// The below implementation is taken from React Native's source and added a flag to conditionally attach/remove listeners
export const useDimensionsWithEnable = ({ enable }: { enable?: boolean }) => {
  const [dimensions, setDimensions] = React.useState(() =>
    Dimensions.get('window')
  );

  React.useEffect(() => {
    if (enable) {
      function handleChange({ window }: { window: ScaledSize }) {
        if (
          dimensions.width !== window.width ||
          dimensions.height !== window.height ||
          dimensions.scale !== window.scale ||
          dimensions.fontScale !== window.fontScale
        ) {
          setDimensions(window);
        }
      }
      const subscription: any = Dimensions.addEventListener(
        'change',
        handleChange
      );
      // We might have missed an update between calling `get` in render and
      // `addEventListener` in this handler, so we set it here. If there was
      // no change, React will filter out this update as a no-op.
      handleChange({ window: Dimensions.get('window') });

      return () => {
        // React Native >= 0.65 (including 0.84) returns a subscription
        // object with a remove method. We target that API and drop the
        // legacy removeEventListener path.
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      };
    }
    return () => {};
  }, [dimensions, enable]);
  return dimensions;
};
