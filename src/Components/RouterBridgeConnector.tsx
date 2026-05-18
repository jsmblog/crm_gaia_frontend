import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigate } from './AI/routerBridge';

export const RouterBridgeConnector = () => {
  const nav = useNavigate();
  useEffect(() => {
    setNavigate((route) => nav(route));
  }, [nav]);
  return null;
};
