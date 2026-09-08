import { motion, useTransform, type MotionValue } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { smooth } from './timeline';

export function DemoCursor({
  time,
  contentWidth,
}: {
  time: MotionValue<number>;
  contentWidth: number;
}) {
  const x = useTransform(time, (t) =>
    t < 6
      ? 310 + (contentWidth - 365) * smooth(2.7, 3.2, t) - 50 * smooth(3.7, 4.4, t)
      : t < 10
        ? 390 - 140 * smooth(7, 8, t)
        : 440 - 90 * smooth(10.8, 11.6, t)
  );
  const y = useTransform(time, (t) =>
    t < 6
      ? 250 - 120 * smooth(2.7, 3.2, t) + 237 * smooth(3.7, 4.4, t)
      : t < 10
        ? 300 + 30 * smooth(7, 8, t)
        : 390 - 55 * smooth(10.8, 11.6, t)
  );
  const opacity = useTransform(time, (t) => {
    const range = [
      [2.7, 5.2],
      [7, 8.7],
      [10.8, 12.1],
    ].find(([a, b]) => t >= a && t < b);
    return range
      ? smooth(range[0], range[0] + 0.25, t) * (1 - smooth(range[1] - 0.25, range[1], t))
      : 0;
  });
  const scale = useTransform(
    time,
    (t) =>
      1 -
      0.15 *
        (smooth(3.3, 3.45, t) -
          smooth(3.45, 3.6, t) +
          smooth(4.4, 4.55, t) -
          smooth(4.55, 4.7, t) +
          smooth(11.6, 11.75, t) -
          smooth(11.75, 11.9, t))
  );
  return (
    <motion.div className="demo-cursor" style={{ x, y, opacity, scale }}>
      <MousePointer2 size={23} fill="#080b10" stroke="white" />
    </motion.div>
  );
}
