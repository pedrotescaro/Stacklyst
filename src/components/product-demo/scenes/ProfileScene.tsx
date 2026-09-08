import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ProfileHero } from '@/components/ProfileHero';
import { demoProfile, demoTrails } from '../demo-data';
import { smooth } from '../timeline';
const noop = () => {};
export function ProfileScene({ time }: { time: MotionValue<number> }) {
  const y = useTransform(time, (t) => -300 * smooth(15, 17.3, t));
  return (
    <motion.div style={{ y }}>
      <ProfileHero
        currentUserId="product-demo"
        profile={demoProfile}
        trails={demoTrails}
        stats={{ answers_count: 1, accuracy: 0, accepted_count: 1 }}
        following={false}
        followers={1}
        followingCount={0}
        onEdit={noop}
        onFollowToggle={async () => {}}
        onShowFollowers={noop}
        onShowFollowing={noop}
      />
    </motion.div>
  );
}
