import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  CognitiveStatus,
  FocusState,
  Loop,
  Thread,
  EmotionalState,
  ToastMessage,
} from '@/types';
import { dashboardAPI } from '@/services/api';
import { generateId } from '@/utils/helpers';

// ============================================================================
// STATE TYPES
// ============================================================================

interface CognitiveState {
  status: CognitiveStatus | null;
  focus: FocusState | null;
  loops: Loop[];
  threads: Thread[];
  emotions: EmotionalState[];
  toasts: ToastMessage[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_STATUS'; payload: CognitiveStatus }
  | { type: 'SET_FOCUS'; payload: FocusState | null }
  | { type: 'SET_LOOPS'; payload: Loop[] }
  | { type: 'ADD_LOOP'; payload: Loop }
  | { type: 'UPDATE_LOOP'; payload: Loop }
  | { type: 'REMOVE_LOOP'; payload: string }
  | { type: 'SET_THREADS'; payload: Thread[] }
  | { type: 'ADD_THREAD'; payload: Thread }
  | { type: 'REMOVE_THREAD'; payload: string }
  | { type: 'SET_EMOTIONS'; payload: EmotionalState[] }
  | { type: 'ADD_EMOTION'; payload: EmotionalState }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface CognitiveContextValue {
  state: CognitiveState;
  dispatch: React.Dispatch<Action>;
  refreshStatus: () => Promise<void>;
  addToast: (type: ToastMessage['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: CognitiveState = {
  status: null,
  focus: null,
  loops: [],
  threads: [],
  emotions: [],
  toasts: [],
  isLoading: false,
  error: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function cognitiveReducer(state: CognitiveState, action: Action): CognitiveState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload, error: null };

    case 'SET_FOCUS':
      return { ...state, focus: action.payload };

    case 'SET_LOOPS':
      return { ...state, loops: action.payload };

    case 'ADD_LOOP':
      return { ...state, loops: [action.payload, ...state.loops] };

    case 'UPDATE_LOOP':
      return {
        ...state,
        loops: state.loops.map((loop) =>
          loop.id === action.payload.id ? action.payload : loop
        ),
      };

    case 'REMOVE_LOOP':
      return {
        ...state,
        loops: state.loops.filter((loop) => loop.id !== action.payload),
      };

    case 'SET_THREADS':
      return { ...state, threads: action.payload };

    case 'ADD_THREAD':
      return { ...state, threads: [action.payload, ...state.threads] };

    case 'REMOVE_THREAD':
      return {
        ...state,
        threads: state.threads.filter((thread) => thread.id !== action.payload),
      };

    case 'SET_EMOTIONS':
      return { ...state, emotions: action.payload };

    case 'ADD_EMOTION':
      return { ...state, emotions: [action.payload, ...state.emotions] };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const CognitiveStateContext = createContext<CognitiveContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface CognitiveStateProviderProps {
  children: ReactNode;
}

export function CognitiveStateProvider({ children }: CognitiveStateProviderProps) {
  const [state, dispatch] = useReducer(cognitiveReducer, initialState);

  const refreshStatus = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await dashboardAPI.getStatus();
      dispatch({ type: 'SET_STATUS', payload: response.data });
    } catch (err) {
      console.error('Failed to fetch status:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to fetch cognitive status',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const toast: ToastMessage = {
      id: generateId(),
      type,
      message,
    };
    dispatch({ type: 'ADD_TOAST', payload: toast });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  // Poll status every 5 seconds
  useEffect(() => {
    refreshStatus();

    const interval = setInterval(() => {
      refreshStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshStatus]);

  const value: CognitiveContextValue = {
    state,
    dispatch,
    refreshStatus,
    addToast,
    dismissToast,
  };

  return (
    <CognitiveStateContext.Provider value={value}>
      {children}
    </CognitiveStateContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useCognitiveState() {
  const context = useContext(CognitiveStateContext);
  if (!context) {
    throw new Error(
      'useCognitiveState must be used within a CognitiveStateProvider'
    );
  }
  return context;
}

export default CognitiveStateContext;
