import { useReactive } from '@lotexiu/react'
import { theme } from './theme/service'

function App() {
  const mode = useReactive(theme.mode)

  return (
    <>
      <div className='grow'>
        <button onClick={
          () => theme.mode.set(mode === 'dark' ? 'light' : 'dark')
        }>
          {mode}
        </button>
      </div>

      <div>
        bottombar
      </div>
    </>
  )
}

export default App
