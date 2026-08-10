'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Logger på...');

  useEffect(() => {
    async function handleCallback() {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage('Noe gikk galt: ' + error.message);
      } else {
        setMessage('Suksess! Videresender...');
        router.push('/');
      }
    }
    
    handleCallback();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text-body)',
    }}>
      <p>{message}</p>
    </div>
  );
}
