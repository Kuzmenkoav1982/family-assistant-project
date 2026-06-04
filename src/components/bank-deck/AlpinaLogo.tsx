export default function AlpinaLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-1.5' };
  return (
    <span
      className={`inline-flex items-center font-bold rounded ${sizes[size]}`}
      style={{ background: '#FFD100', color: '#000', fontFamily: 'sans-serif', letterSpacing: '-0.02em' }}
    >
      альпина
    </span>
  );
}
