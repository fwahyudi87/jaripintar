import { useGame } from '../context/GameContext.jsx'
import SplashScreen from './SplashScreen.jsx'
import MenuScreen from './MenuScreen.jsx'
import LetterHunt from './LetterHunt.jsx'
import BalloonCatch from './BalloonCatch.jsx'
import KiteCatch from './KiteCatch.jsx'
import RocketCatch from './RocketCatch.jsx'
import NameFragment from './NameFragment.jsx'
import TRexJump from './TRexJump.jsx'
import MagicCarRace from './MagicCarRace.jsx'
import SpaceBubbleRescue from './SpaceBubbleRescue.jsx'

export default function GameScreen() {
  const { state } = useGame()

  switch (state.screen) {
    case 'splash':
      return <SplashScreen />
    case 'menu':
      return <MenuScreen />
    case 'letterHunt':
      return <LetterHunt />
    case 'balloonCatch':
      return <BalloonCatch />
    case 'kiteCatch':
      return <KiteCatch />
    case 'rocketCatch':
      return <RocketCatch />
    case 'nameFragment':
      return <NameFragment />
    case 'tRexJump':
      return <TRexJump />
    case 'magicCarRace':
      return <MagicCarRace />
    case 'spaceBubbleRescue':
      return <SpaceBubbleRescue />
    default:
      return <SplashScreen />
  }
}
