type ControllersProps = {
    addCount: () => void
}

export function Controllers({addCount}: ControllersProps) {
    return (
        <div className="card">
          <button className="border border-gray-700 shadow" onClick={addCount}>
            Add 1
          </button>
        </div>
    )
}
