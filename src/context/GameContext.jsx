import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const SCREEN = { SPLASH: 'splash', LETTER_HUNT: 'letterHunt', BALLOON_CATCH: 'balloonCatch', KITE_CATCH: 'kiteCatch', ROCKET_CATCH: 'rocketCatch' }
const STORAGE_KEY = 'jaripintar_session'

const initialState = {
  screen: SCREEN.SPLASH,
  score: 0,
  module1Done: false,
  module2Unlocked: false,
  module3Unlocked: false,
  module4Unlocked: false,
  name: '',
  gender: 'boy',
}

function loadSession() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) return { ...initialState, ...JSON.parse(saved), screen: SCREEN.SPLASH }
  } catch { /* ignore */ }
  return initialState
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, name: action.payload.name, gender: action.payload.gender }
    case 'START_GAME':
      return { ...state, screen: SCREEN.LETTER_HUNT }
    case 'ADD_SCORE':
      return { ...state, score: state.score + action.payload }
    case 'COMPLETE_MODULE1':
      return { ...state, module1Done: true, module2Unlocked: true }
    case 'UNLOCK_MODULE3':
      return { ...state, module3Unlocked: true }
    case 'UNLOCK_MODULE4':
      return { ...state, module4Unlocked: true }
    case 'START_MODULE2':
      return { ...state, screen: SCREEN.BALLOON_CATCH }
    case 'START_MODULE3':
      return { ...state, screen: SCREEN.KITE_CATCH }
    case 'START_MODULE4':
      return { ...state, screen: SCREEN.ROCKET_CATCH }
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadSession)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      score: state.score,
      module1Done: state.module1Done,
      module2Unlocked: state.module2Unlocked,
      module3Unlocked: state.module3Unlocked,
      module4Unlocked: state.module4Unlocked,
      name: state.name,
      gender: state.gender,
    }))
  }, [state.score, state.module1Done, state.module2Unlocked, state.module3Unlocked, state.module4Unlocked])

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), [])
  const addScore = useCallback((pts) => dispatch({ type: 'ADD_SCORE', payload: pts }), [])
  const completeModule1 = useCallback(() => dispatch({ type: 'COMPLETE_MODULE1' }), [])
  const unlockModule3 = useCallback(() => dispatch({ type: 'UNLOCK_MODULE3' }), [])
  const unlockModule4 = useCallback(() => dispatch({ type: 'UNLOCK_MODULE4' }), [])
  const startModule2 = useCallback(() => dispatch({ type: 'START_MODULE2' }), [])
  const startModule3 = useCallback(() => dispatch({ type: 'START_MODULE3' }), [])
  const startModule4 = useCallback(() => dispatch({ type: 'START_MODULE4' }), [])
  const setScreen = useCallback((s) => dispatch({ type: 'SET_SCREEN', payload: s }), [])
  const setProfile = useCallback((name, gender) => dispatch({ type: 'SET_PROFILE', payload: { name, gender } }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <GameContext.Provider value={{ state, startGame, addScore, completeModule1, startModule2, startModule3, startModule4, setScreen, setProfile, unlockModule3, unlockModule4, reset, SCREEN }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}
