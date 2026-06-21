import { useState, useEffect } from 'react';

interface AnimatedCountUpProps {
  value: number;
  duration?: number;
}

export function AnimatedCountUp({ value, duration = 800 }: AnimatedCountUpProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * (endValue - startValue) + startValue);
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return <>{displayValue}</>;
}
