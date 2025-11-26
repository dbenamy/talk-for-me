import './style.css'
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime'

type AgentState = 'idle' | 'connecting' | 'live' | 'paused' | 'error'

// Put your long-form agent instructions here. This string can be as detailed as you need
// (tone, constraints, safety rules, persona, etc.).
const AGENT_INSTRUCTIONS = `
You are assisting someone with a medical condition that can make them lock up when talking. They need to explain their condition to their doctor and set an appointment. You must represent them fully to the doctor and secure the care they need. Do not ask the original user any questions—they might be locked up. Be clear, concise, and empathetic while conveying their situation and needs to the doctor so the appointment can be scheduled and appropriate care arranged. Their name is Bob Smith and their date of birth is 8/22/90.
`.trim()

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App container not found')
}

app.innerHTML = `
  <main class="shell">
    <section class="panel">
      <div class="header">
        <p class="eyebrow">Talk for Me</p>
        <h1>Voice Agent Control</h1>
        <p class="lede">Monitor the agent status and pause or resume listening with a single click.</p>
      </div>
      <div class="status-card">
        <div class="status-label">Status</div>
        <div id="agent-status" class="status-pill" data-state="idle">Idle</div>
        <p id="agent-note" class="status-note">Enter an ephemeral API key to connect.</p>
      </div>
      <div class="button-row">
        <button id="toggle-pause" class="primary" disabled>Pause Agent</button>
        <button id="restart-agent" class="ghost">Restart Agent</button>
      </div>
    </section>
    <section class="panel instructions">
      <h2>Agent Instructions</h2>
      <label class="field">
        <span class="field-label">Ephemeral API Key</span>
        <input id="api-key" type="text" placeholder="ek_..." value="" />
        <span class="field-hint">Get one with the OpenAI key in your shell:</span>
        <pre class="code-block">curl -s -X POST https://api.openai.com/v1/realtime/client_secrets \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"session":{"type":"realtime","model":"gpt-realtime"}}' | jq -r .value</pre>
      </label>
      <label class="field">
        <span class="field-label">Instructions sent to the voice agent</span>
        <textarea id="instructions-input" rows="8" spellcheck="false"></textarea>
        <span class="field-hint">These instructions are applied every time you restart the agent.</span>
      </label>
    </section>
  </main>
`

function requireElement<T extends Element>(el: T | null, message: string): T {
  if (!el) throw new Error(message)
  return el
}

const statusEl = requireElement(
  document.querySelector<HTMLDivElement>('#agent-status'),
  'Missing status element',
)
const noteEl = requireElement(
  document.querySelector<HTMLParagraphElement>('#agent-note'),
  'Missing status note element',
)
const toggleButton = requireElement(
  document.querySelector<HTMLButtonElement>('#toggle-pause'),
  'Missing toggle button',
)
const restartButton = requireElement(
  document.querySelector<HTMLButtonElement>('#restart-agent'),
  'Missing restart button',
)
const instructionsInput = requireElement(
  document.querySelector<HTMLTextAreaElement>('#instructions-input'),
  'Missing instructions input',
)
const apiKeyInput = requireElement(
  document.querySelector<HTMLInputElement>('#api-key'),
  'Missing API key input',
)

instructionsInput.value = AGENT_INSTRUCTIONS
apiKeyInput.value = ''

let session: RealtimeSession | null = null
let isPaused = false

const statusCopy: Record<AgentState, string> = {
  idle: 'Idle',
  connecting: 'Connecting…',
  live: 'Live',
  paused: 'Paused',
  error: 'Error',
}

function setStatus(state: AgentState, note: string) {
  statusEl.textContent = statusCopy[state]
  statusEl.dataset.state = state
  noteEl.textContent = note
}

function closeAgent() {
  if (session) {
    try {
      session.close()
    } catch (error) {
      console.warn('Failed to close existing session', error)
    }
  }
  session = null
}

async function startAgent(instructions: string, apiKey: string) {
  setStatus('connecting', 'Preparing your voice agent.')
  toggleButton.disabled = true
  restartButton.disabled = true
  isPaused = false
  toggleButton.textContent = 'Pause Agent'

  try {
    closeAgent()
    const agent = new RealtimeAgent({
      name: 'Voice Agent',
      instructions,
    })

    session = new RealtimeSession(agent)
    await session.connect({
      apiKey,
    })

    setStatus('live', 'Microphone and speaker connected.')
    toggleButton.disabled = false
    restartButton.disabled = false
  } catch (error) {
    console.error('Failed to start agent:', error)
    setStatus('error', 'Unable to connect. Check your API key or network.')
    restartButton.disabled = false
  }
}

toggleButton.addEventListener('click', () => {
  if (!session) return

  isPaused = !isPaused
  try {
    session.mute(isPaused)
  } catch (error) {
    console.error('Failed to update mute state:', error)
    setStatus('error', 'Mute/unmute failed. See console for details.')
    return
  }

  if (isPaused) {
    setStatus('paused', 'Agent is muted and will not listen.')
    toggleButton.textContent = 'Unpause Agent'
  } else {
    setStatus('live', 'Agent is listening.')
    toggleButton.textContent = 'Pause Agent'
  }
})

restartButton.addEventListener('click', () => {
  const instructions = instructionsInput.value.trim() || AGENT_INSTRUCTIONS
  const apiKey = apiKeyInput.value.trim()

  if (!apiKey) {
    setStatus('error', 'API key is required to start the agent.')
    return
  }

  startAgent(instructions, apiKey)
})

setStatus('idle', 'Enter an ephemeral API key to connect.')
