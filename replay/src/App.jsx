import { useState } from 'react'
import ReplayScene from './ReplayScene'

function App() {
  const [mapName, setMapName] = useState('')
  const [initialState, setInitialState] = useState('')
  const [updates, setUpdates] = useState('')
  const [startReplay, setStartReplay] = useState(false)

  const handleStartReplay = () => {
    if (mapName && initialState && updates) {
      setStartReplay(true)
    } else {
      alert('Please fill in all fields')
    }
  }

  if (startReplay) {
    return <ReplayScene mapName={mapName} initialState={JSON.parse(initialState)} updates={JSON.parse(updates)} />
  }

  return (
    <div>
      <h1>Game Replay Setup</h1>
      <div>
        <label htmlFor="mapName">Map Name:</label>
        <input 
          type="text" 
          id="mapName" 
          value={mapName} 
          onChange={(e) => setMapName(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label htmlFor="initialState">Initial State (JSON):</label>
        <textarea 
          id="initialState" 
          value={initialState} 
          onChange={(e) => setInitialState(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label htmlFor="updates">Updates (JSON array):</label>
        <textarea 
          id="updates" 
          value={updates} 
          onChange={(e) => setUpdates(e.target.value)} 
          required 
        />
      </div>
      <button onClick={handleStartReplay}>Start Replay</button>
    </div>
  )
}

export default App