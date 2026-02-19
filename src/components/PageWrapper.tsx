import { useLocation } from 'react-router-dom';

const NO_PADDING_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noPadding = NO_PADDING_ROUTES.some(r => location.pathname.startsWith(r));

  if (noPadding) {
    return <>{children}</>;
  }

  return (
    <div className="pt-16 pb-14">
      {children}
    </div>
  );
}