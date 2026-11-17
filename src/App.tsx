import type { ReactNode } from 'react'
import { useReactive } from '@lotexiu/react'
import { AppearanceSettings } from './desk/appearance-settings'
import { ContrastReport } from './desk/contrast-report'
import { ColorsWindow } from './desk/colors'
import { FilesWindow } from './desk/files'
import { ProfileForm } from './desk/profile-form'
import { useDeskWindows } from './desk/use-desk-windows'
import { theme } from './theme/service'

const windowContents: Record<string, ReactNode> = {
	settings: <AppearanceSettings />,
	contrast: <ContrastReport />,
	profile: <ProfileForm />,
	files: <FilesWindow />,
	colors: <ColorsWindow />,
}

function App() {
  const { Desktop, Panel, Window } = useReactive(theme.components)
  const desk = useDeskWindows([
    { id: 'settings', title: 'Configurações do sistema', frame: { left: 64, top: 48, width: 480, height: 430 }, open: true, minimized: false, maximized: false },
    { id: 'contrast', title: 'Verificação de contraste', frame: { left: 560, top: 120, width: 420, height: 420 }, open: false, minimized: false, maximized: false },
    { id: 'profile', title: 'Cadastro', frame: { left: 180, top: 240, width: 520, height: 400 }, open: false, minimized: false, maximized: false },
    { id: 'files', title: 'Arquivos', frame: { left: 620, top: 60, width: 440, height: 420 }, open: true, minimized: false, maximized: false },
    { id: 'colors', title: 'Cores', frame: { left: 260, top: 300, width: 460, height: 260 }, open: true, minimized: false, maximized: false },
  ])

  return (
    <Desktop panel={<Panel tasks={desk.tasks} onTaskSelect={desk.selectTask} onLauncherSelect={() => desk.focus('settings')} />}>
      {desk.visibleWindows.map((deskWindow) => (
        <Window
          key={deskWindow.id}
          title={deskWindow.title}
          active={deskWindow.id === desk.activeId}
          maximized={deskWindow.maximized}
          frame={deskWindow.frame}
          layer={desk.layerOf(deskWindow.id)}
          onFocus={() => desk.focus(deskWindow.id)}
          onMove={(frame) => desk.move(deskWindow.id, frame)}
          onMinimize={() => desk.minimize(deskWindow.id)}
          onMaximize={() => desk.toggleMaximize(deskWindow.id)}
          onClose={() => desk.close(deskWindow.id)}
        >
          {windowContents[deskWindow.id]}
        </Window>
      ))}
    </Desktop>
  )
}

export default App
