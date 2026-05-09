import { useGame } from '../context/GameContext.jsx'
import SplashScreen from './SplashScreen.jsx'
import LetterHunt from './LetterHunt.jsx'
import BalloonCatch from './BalloonCatch.jsx'
import KiteCatch from './KiteCatch.jsx'
import RocketCatch from './RocketCatch.jsx'

export default function GameScreen() {
  const { state } = useGame()

  switch (state.screen) {
    case 'splash':
      return <SplashScreen />
    case 'letterHunt':
      return <LetterHunt />
    case 'balloonCatch':
      return <BalloonCatch />
    case 'kiteCatch':
      return <KiteCatch />
    case 'rocketCatch':
      return <RocketCatch />
    default:
      return <SplashScreen />
  }
}
