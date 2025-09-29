// src/components/auth/WelcomeEmail.jsx
import { useEmailSender } from '@/hooks/useEmail';

function WelcomeEmail({ user }) {
  const { sendTemplate } = useEmailSender();

  useEffect(() => {
    sendTemplate('welcome', {
      name: user.name,
      email: user.email
    }, user.email);
  }, [user]);
}