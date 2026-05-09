import { useMemo } from 'react'
import { Howl } from 'howler'
import { makeChimeDataUri, makeBoopDataUri } from '../utils/makeSound.js'

export default function useSoundFeedback() {
  const sounds = useMemo(() => {
    const chimeUri = makeChimeDataUri()
    const boopUri = makeBoopDataUri()

    return {
      correct: new Howl({ src: [chimeUri], format: ['wav'] }),
      wrong: new Howl({ src: [boopUri], format: ['wav'] }),
    }
  }, [])

  return sounds
}
