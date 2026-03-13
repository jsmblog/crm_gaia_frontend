import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ToastType } from "../Interfaces/i_toast";

export const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2  size={17} />,
  error:   <XCircle       size={17} />,
  warning: <AlertTriangle size={17} />,
  info:    <Info          size={17} />,
};

export const COLORS: Record<ToastType, string> = {
  success: '#95B359',
  error:   '#E05C5C',
  warning: '#D4A843',
  info:    '#779CAB',
};