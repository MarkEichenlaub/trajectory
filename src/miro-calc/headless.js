// Headless app iframe (the Miro app's sdkUri). Loads whenever Mark has a
// board open with the app installed — panel open or not — and runs the
// engine host so student input on board widgets always gets answered.
/* global miro */
import { startHost } from './board/host.js'

async function init() {
  if (typeof miro === 'undefined') {
    document.body.innerHTML = '<p style="font-family:sans-serif">This page runs inside Miro as an app iframe.</p>'
    return
  }

  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({ url: '/miro-calc/panel.html' })
  })

  try {
    await startHost()
  } catch (err) {
    console.error('miro-calc: host failed to start', err)
  }
}

init()
