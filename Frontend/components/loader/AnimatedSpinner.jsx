import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedSpinner = ({
  size = 100,
  strokeWidth = 4,
  spinnerColor = '#3498db',
  successColor = '#2ecc71',
  failureColor = '#e74c3c',
  state,
}) => {
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (state === 'spinning') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      );
      progress.value = 0;
    } else {
      rotation.value = withTiming(0);
      progress.value = withTiming(1, { duration: 500 });
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [state]);

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [0, -2 * Math.PI * (size / 2 - strokeWidth / 2)]),
  }));

  const checkmarkAnimatedProps = useAnimatedProps(() => ({
    opacity: state === 'success' ? progress.value : 0,
    d: `M${size * 0.3},${size * 0.5} L${size * 0.45},${size * 0.65} L${size * 0.7},${size * 0.35}`,
  }));

  const crossAnimatedProps = useAnimatedProps(() => ({
    opacity: state === 'failure' ? progress.value : 0,
    d: `M${size * 0.3},${size * 0.3} L${size * 0.7},${size * 0.7} M${size * 0.3},${size * 0.7} L${size * 0.7},${size * 0.3}`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Svg width={size} height={size}>
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth / 2}
          stroke={state === 'spinning' ? spinnerColor : state === 'success' ? successColor : failureColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${2 * Math.PI * (size / 2 - strokeWidth / 2)} ${2 * Math.PI * (size / 2 - strokeWidth / 2)}`}
          animatedProps={circleAnimatedProps}
          fill="none"
        />
        <AnimatedPath
          stroke={successColor}
          strokeWidth={strokeWidth}
          fill="none"
          animatedProps={checkmarkAnimatedProps}
        />
        <AnimatedPath
          stroke={failureColor}
          strokeWidth={strokeWidth}
          fill="none"
          animatedProps={crossAnimatedProps}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedSpinner;
