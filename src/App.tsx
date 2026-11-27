import { useState } from 'react'
import Gallery from './components/Gallery'
import Forge from './components/Forge'
import './App.css'

type View = 'gallery' | 'forge'

function App() {
  const [view, setView] = useState<View>('gallery')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="brand" onClick={() => setView('gallery')}>
            顶会主图画廊
          </h1>
          <nav className="nav">
            <button
              className={`nav-btn ${view === 'gallery' ? 'active' : ''}`}
              onClick={() => setView('gallery')}
            >
              画廊
            </button>
            <button
              className={`nav-btn ${view === 'forge' ? 'active' : ''}`}
              onClick={() => setView('forge')}
            >
              PaperFigure Studio
            </button>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {view === 'gallery' ? <Gallery /> : <Forge />}
      </main>
    </div>
  )
}

export default App
