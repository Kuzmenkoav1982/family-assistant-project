export function EcosystemSvgDefs() {
  return (
    <defs>
      {/* Светофор: насыщенные радиальные градиенты */}
      <radialGradient id="ecoLive" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="55%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <radialGradient id="ecoLiveH" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="55%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </radialGradient>
      <radialGradient id="ecoDev" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="55%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </radialGradient>
      <radialGradient id="ecoDevH" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="55%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#eab308" />
      </radialGradient>
      <radialGradient id="ecoPlanned" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="55%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#991b1b" />
      </radialGradient>
      <radialGradient id="ecoPlannedH" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#fecaca" />
        <stop offset="55%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#b91c1c" />
      </radialGradient>
      {/* Центр — оранжево-красный градиент в цвет лого 7Я */}
      <radialGradient id="centerGrad" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="35%" stopColor="#fb923c" />
        <stop offset="75%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </radialGradient>
    </defs>
  );
}

export default EcosystemSvgDefs;
