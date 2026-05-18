import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const CalendarioCallback = () => {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  useEffect(() => {
    const linked = params.get('linked');
    navigate(`/calendario?linked=${linked ?? 'false'}`, { replace: true });
  }, []);

  return null;
};