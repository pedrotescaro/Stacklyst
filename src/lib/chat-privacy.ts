import { z } from 'zod';

export const chatAudience = z.enum(['everyone', 'following', 'mutual', 'nobody']);
export type ChatAudience = z.infer<typeof chatAudience>;
export interface ChatPrivacy {
  showOnline: boolean;
  messages: ChatAudience;
  groups: ChatAudience;
}

export const defaultChatPrivacy: ChatPrivacy = {
  showOnline: true,
  messages: 'mutual',
  groups: 'mutual',
};

export const chatPrivacyChange = z.discriminatedUnion('setting', [
  z.object({ setting: z.literal('showOnline'), value: z.boolean() }),
  z.object({ setting: z.enum(['messages', 'groups']), value: chatAudience }),
]);
export type ChatPrivacyChange = z.infer<typeof chatPrivacyChange>;
