import type { ChatRequest, ChatResponse } from '@fintech/shared';
import { apiPost } from './client';

export const sendChatMessage = (req: ChatRequest) => apiPost<ChatResponse>('/api/chat', req);
