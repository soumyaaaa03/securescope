export default function Navbar({ page, setPage }) {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke="#818cf8" strokeWidth="1.2"/>
            <circle cx="8" cy="8" r="2" fill="#34d399"/>
          </svg>
        </div>
        <span className="font-medium text-gray-900 text-sm">SecureScope</span>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
          beta
        </span>
      </div>

      <div className="flex gap-1">
        {['home', 'history'].map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`text-sm px-4 py-1.5 rounded-lg transition-colors capitalize ${
              page === p
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {p === 'home' ? 'Scanner' : 'History'}
          </button>
        ))}
      </div>

      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
        AK
      </div>
    </nav>
  )
}