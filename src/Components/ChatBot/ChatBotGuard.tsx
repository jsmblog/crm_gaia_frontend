import { useAuth }  from '../../Context/AuthContext';
import { ChatBot } from '../../Pages/ChatBot/ChatBot';

export const ChatBotGuard = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <ChatBot />;
};