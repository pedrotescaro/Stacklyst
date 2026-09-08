import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { cameraAt } from './timeline';
export function DemoCamera({
  time,
  mobile,
  children,
}: {
  time: MotionValue<number>;
  mobile: boolean;
  children: ReactNode;
}) {
  const scale = useTransform(time, (t) => cameraAt(t, mobile).scale);
  const x = useTransform(time, (t) => cameraAt(t, mobile).x);
  const y = useTransform(time, (t) => cameraAt(t, mobile).y);
  return (
    <motion.div className="demo-camera" style={{ scale, x, y }}>
      {children}
    </motion.div>
  );
}
