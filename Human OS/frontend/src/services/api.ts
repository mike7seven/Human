import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  CognitiveStatus,
  FocusSetRequest,
  FocusLockRequest,
  FocusResponse,
  LoopAuthorizeRequest,
  LoopCloseRequest,
  LoopKillRequest,
  LoopResponse,
  LoopsListResponse,
  ThreadSpawnRequest,
  ThreadBackgroundRequest,
  ThreadTerminateRequest,
  ThreadResponse,
  ThreadsListResponse,
  IngestTaskRequest,
  IngestIdeaRequest,
  IngestResponse,
  ArchiveCommitRequest,
  ArchiveResponse,
  ArchivesListResponse,
  PredictRunRequest,
  PredictStopRequest,
  PredictResponse,
  EmotionTagRequest,
  EmotionDecompressRequest,
  EmotionResponse,
  EmotionsListResponse,
  AIOffloadRequest,
  AIAssistRequest,
  AIResponse,
  ResetResponse,
  ErrorResponse,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging/auth
api.interceptors.request.use(
  (config) => {
    // Could add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardAPI = {
  getStatus: () =>
    api.get<CognitiveStatus>('/dashboard/status'),
};

// ============================================================================
// FOCUS API
// ============================================================================

export const focusAPI = {
  setFocus: (data: FocusSetRequest) =>
    api.post<FocusResponse>('/focus/set', data),

  lockFocus: (data: FocusLockRequest) =>
    api.post<FocusResponse>('/focus/lock', data),

  clearFocus: () =>
    api.delete<FocusResponse>('/focus/clear'),

  getFocus: () =>
    api.get<FocusResponse>('/focus/current'),
};

// ============================================================================
// LOOP API
// ============================================================================

export const loopAPI = {
  authorize: (data: LoopAuthorizeRequest) =>
    api.post<LoopResponse>('/loop/authorize', data),

  close: (data: LoopCloseRequest) =>
    api.post<LoopResponse>('/loop/close', data),

  kill: (data: LoopKillRequest) =>
    api.delete<LoopResponse>('/loop/kill', { data }),

  list: (queue?: string) =>
    api.get<LoopsListResponse>('/loop/list', { params: { queue } }),

  get: (id: string) =>
    api.get<LoopResponse>(`/loop/${id}`),
};

// ============================================================================
// THREAD API
// ============================================================================

export const threadAPI = {
  spawn: (data: ThreadSpawnRequest) =>
    api.post<ThreadResponse>('/thread/spawn', data),

  background: (data: ThreadBackgroundRequest) =>
    api.post<ThreadResponse>('/thread/background', data),

  terminate: (data: ThreadTerminateRequest) =>
    api.delete<ThreadResponse>('/thread/terminate', { data }),

  list: () =>
    api.get<ThreadsListResponse>('/thread/list'),

  get: (id: string) =>
    api.get<ThreadResponse>(`/thread/${id}`),
};

// ============================================================================
// INGEST API
// ============================================================================

export const ingestAPI = {
  task: (data: IngestTaskRequest) =>
    api.post<IngestResponse>('/ingest/task', data),

  idea: (data: IngestIdeaRequest) =>
    api.post<IngestResponse>('/ingest/idea', data),
};

// ============================================================================
// ARCHIVE API
// ============================================================================

export const archiveAPI = {
  commit: (data: ArchiveCommitRequest) =>
    api.post<ArchiveResponse>('/archive/commit', data),

  list: () =>
    api.get<ArchivesListResponse>('/archive/list'),

  get: (id: string) =>
    api.get<ArchiveResponse>(`/archive/${id}`),
};

// ============================================================================
// PREDICT API
// ============================================================================

export const predictAPI = {
  run: (data: PredictRunRequest) =>
    api.post<PredictResponse>('/predict/run', data),

  stop: (data: PredictStopRequest) =>
    api.delete<PredictResponse>('/predict/stop', { data }),
};

// ============================================================================
// EMOTION API
// ============================================================================

export const emotionAPI = {
  tag: (data: EmotionTagRequest) =>
    api.post<EmotionResponse>('/emotion/tag', data),

  decompress: (data: EmotionDecompressRequest) =>
    api.post<EmotionResponse>('/emotion/decompress', data),

  list: () =>
    api.get<EmotionsListResponse>('/emotion/list'),
};

// ============================================================================
// AI API
// ============================================================================

export const aiAPI = {
  offload: (data: AIOffloadRequest) =>
    api.post<AIResponse>('/ai/offload', data),

  assist: (data: AIAssistRequest) =>
    api.post<AIResponse>('/ai/assist-for-execution', data),
};

// ============================================================================
// MODE API
// ============================================================================

export const modeAPI = {
  resetSoft: () =>
    api.post<ResetResponse>('/mode/reset-soft'),

  resetHard: () =>
    api.post<ResetResponse>('/mode/reset-hard'),
};

// Export the axios instance for custom requests
export default api;
