import { useState } from 'react'
import './App.css'
import { Asset, AssetTypes, AssetStore } from './components/Store'
import { Assets } from './components/Assets'

function App() {
  const [count, setCount] = useState(0)
  const [assets, setAssets] = useState<Asset[]>([])

  const addAsset = (asset: Asset) => {
    setAssets([...assets, asset])
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-fit text-center flex flex-col gap-4">
        
        <h1>Workers Factory</h1>
        <div>Counter: {count}</div>

        <div className="card">
          <button className="border border-gray-700 shadow" onClick={() => setCount((count) => count + 1)}>
            Add 1
          </button>
        </div>

        <AssetStore addAsset={addAsset}/>
        <Assets assets={assets}/>
      </div>
    </div>
  )
}

export default App
