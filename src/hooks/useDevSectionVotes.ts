import { useState, useEffect } from 'react';

const FEATURE_VOTES_API = 'https://functions.poehali.dev/af463fd6-2a6f-4b47-9d37-8967f1750af4';

interface SectionVotes {
  up: number;
  down: number;
}

export function useDevSectionVotes() {
  const [votes, setVotes] = useState<Record<string, SectionVotes>>({});
  const [loading, setLoading] = useState(true);

  const fetchVotes = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await fetch(`${FEATURE_VOTES_API}?type=feature`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('[useDevSectionVotes] Failed to fetch votes:', response.status);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.votes) {
        setVotes(data.votes);
      }
    } catch (error) {
      console.error('[useDevSectionVotes] Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (sectionId: string, voteType: 'up' | 'down', comment?: string) => {
    const authUser = localStorage.getItem('user');
    
    if (!authUser) {
      return { success: false, error: 'Необходимо войти для голосования' };
    }
    
    try {
      const userData = JSON.parse(authUser);
      const userId = userData.id;
      
      const response = await fetch(`${FEATURE_VOTES_API}?type=feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          section_id: sectionId,
          vote_type: voteType
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Ошибка голосования' };
      }
      
      const data = await response.json();
      
      if (data.success && data.votes) {
        setVotes(prev => ({
          ...prev,
          [sectionId]: data.votes
        }));
        
        return { success: true };
      }
      
      return { success: false, error: 'Неожиданный ответ сервера' };
    } catch (error) {
      console.error('[useDevSectionVotes] Error casting vote:', error);
      return { success: false, error: 'Ошибка сети' };
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  return {
    votes,
    loading,
    castVote,
    fetchVotes
  };
}