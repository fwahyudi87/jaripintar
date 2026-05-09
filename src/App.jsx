import { GameProvider } from './context/GameContext.jsx'
import GameScreen from './components/GameScreen.jsx'

export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  )
}
