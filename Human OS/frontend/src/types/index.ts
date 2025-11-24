// ============================================================================
// COMMON TYPES
// ============================================================================

export type Priority = 'high' | 'medium' | 'low';
export type LoadLevel = 'low' | 'medium' | 'high';
export type QueueType = 'action' | 'reference' | 'backburner';
export type ThreadMode = 'foreground' | 'background';
export type ClosureType = 'done' | 'paused' | 'abandoned';

// ============================================================================
// FOCUS TYPES
// ============================================================================

export interface FocusState {
  id: string;
  task_name: string;
  duration: string;
  success_criteria: string;
  is_locked: boolean;
  timebox?: string;
  fallback?: string;
  started_at: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FocusSetRequest {
  task_name: string;
  duration: string;
  success_criteria: string;
}

export interface FocusLockRequest {
  task_name: string;
  timebox: string;
  fallback: string;
}

export interface FocusResponse {
  message: string;
  focus?: FocusState;
  timestamp: string;
}

// ============================================================================
// LOOP TYPES
// ============================================================================

export interface Loop {
  id: string;
  description: string;
  priority: Priority;
  queue: QueueType;
  owner: string;
  status: 'open' | 'closed';
  closure_type?: ClosureType;
  next_step?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoopAuthorizeRequest {
  description: string;
  priority: Priority;
  queue: QueueType;
  owner: string;
}

export interface LoopCloseRequest {
  loop_id: string;
  closure_type: ClosureType;
  next_step?: string;
}

export interface LoopKillRequest {
  description: string;
  reason: string;
}

export interface LoopResponse {
  message: string;
  loop_id?: string;
  loop?: Loop;
  timestamp: string;
}

export interface LoopsListResponse {
  loops: Loop[];
  total: number;
  timestamp: string;
}

// ============================================================================
// THREAD TYPES
// ============================================================================

export interface Thread {
  id: string;
  name: string;
  mode: ThreadMode;
  time_scope: string;
  goal?: string;
  status: 'active' | 'terminated';
  created_at: string;
  updated_at: string;
}

export interface ThreadSpawnRequest {
  thread_name: string;
  mode: ThreadMode;
  time_scope: string;
}

export interface ThreadBackgroundRequest {
  thread_name: string;
  goal: string;
}

export interface ThreadTerminateRequest {
  rule: string;
}

export interface ThreadResponse {
  message: string;
  thread_id?: string;
  thread?: Thread;
  timestamp: string;
}

export interface ThreadsListResponse {
  threads: Thread[];
  total: number;
  timestamp: string;
}

// ============================================================================
// TASK & IDEA TYPES (INGESTION)
// ============================================================================

export interface Task {
  id: string;
  description: string;
  category: string;
  urgency: Priority;
  importance: Priority;
  status: 'pending' | 'processed';
  created_at: string;
  updated_at: string;
}

export interface IngestTaskRequest {
  description: string;
  category: string;
  urgency: Priority;
  importance: Priority;
}

export interface Idea {
  id: string;
  idea_summary: string;
  storage: string;
  action_now: boolean;
  status: 'captured' | 'processed';
  created_at: string;
  updated_at: string;
}

export interface IngestIdeaRequest {
  idea_summary: string;
  storage: string;
  action_now: boolean;
}

export interface IngestResponse {
  message: string;
  id: string;
  timestamp: string;
}

// ============================================================================
// ARCHIVE TYPES
// ============================================================================

export interface Archive {
  id: string;
  object: string;
  summary: string;
  lesson?: string;
  created_at: string;
}

export interface ArchiveCommitRequest {
  object: string;
  summary: string;
  lesson?: string;
}

export interface ArchiveResponse {
  message: string;
  archive_id: string;
  timestamp: string;
}

export interface ArchivesListResponse {
  archives: Archive[];
  total: number;
  timestamp: string;
}

// ============================================================================
// PREDICTION TYPES
// ============================================================================

export interface Prediction {
  id: string;
  scenario: string;
  time_horizon: string;
  depth: 'low' | 'medium' | 'deep';
  status: 'running' | 'stopped';
  results?: string;
  created_at: string;
  updated_at: string;
}

export interface PredictRunRequest {
  scenario: string;
  time_horizon: string;
  depth: 'low' | 'medium' | 'deep';
}

export interface PredictStopRequest {
  topic: string;
}

export interface PredictResponse {
  message: string;
  prediction_id?: string;
  prediction?: Prediction;
  timestamp: string;
}

// ============================================================================
// EMOTION TYPES
// ============================================================================

export interface EmotionalState {
  id: string;
  label: string;
  source_guess: string;
  created_at: string;
}

export interface EmotionTagRequest {
  label: string;
  source_guess: string;
}

export interface DecompressSession {
  id: string;
  method: string;
  duration: string;
  status: 'active' | 'completed';
  started_at: string;
  ends_at: string;
  created_at: string;
}

export interface EmotionDecompressRequest {
  method: string;
  duration: string;
}

export interface EmotionResponse {
  message: string;
  id?: string;
  timestamp: string;
}

export interface EmotionsListResponse {
  emotions: EmotionalState[];
  total: number;
  timestamp: string;
}

// ============================================================================
// AI INTEGRATION TYPES
// ============================================================================

export interface AIOffload {
  id: string;
  task_type: string;
  scope: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AIOffloadRequest {
  task_type: string;
  scope: string;
}

export interface AIAssistRequest {
  task: string;
  assistance_type: string;
}

export interface AIResponse {
  message: string;
  id?: string;
  timestamp: string;
}

// ============================================================================
// DASHBOARD/STATUS TYPES
// ============================================================================

export interface CognitiveStatus {
  foreground_threads: string[];
  background_threads: string[];
  emotional_load: LoadLevel;
  open_loops_estimate: number;
  energy_level: LoadLevel;
  current_focus?: string;
  focus_locked: boolean;
  active_predictions: number;
  pending_tasks: number;
  captured_ideas: number;
  timestamp: string;
}

// ============================================================================
// MODE/RESET TYPES
// ============================================================================

export interface ResetResponse {
  message: string;
  reset_type: string;
  timestamp: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  icon?: React.ReactNode;
}
