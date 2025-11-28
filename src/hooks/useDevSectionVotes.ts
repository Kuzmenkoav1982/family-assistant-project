import { useState, useEffect } from 'react';

const DEV_VOTES_API = 'https://functions.poehali.dev/924ae2ba-479e-4582-8fc3-d93a98b18ef9';

interface SectionVotes {
  up: number;
  down: number;
}

export function useDevSectionVotes() {
  const [votes, setVotes] = useState<Record<string, SectionVotes>>({});
  const [loading, setLoading] = useState(true);

  const fetchVotes = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await fetch(DEV_VOTES_API, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки голосов');
      }

      const data = await response.json();
      
      if (data.success) {
        setVotes(data.votes);
      }
    } catch (err) {
      console.error('Error fetching dev section votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (sectionId: string, voteType: 'up' | 'down', comment?: string) => {
    try {
      const authUserStr = localStorage.getItem('authUser');
      let memberId = null;
      
      if (authUserStr) {
        try {
          const authUser = JSON.parse(authUserStr);
          memberId = authUser.member_id;
        } catch {
          console.error('Error parsing authUser');
        }
      }
      
      const response = await fetch(DEV_VOTES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          section_id: sectionId,
          vote_type: voteType,
          comment: comment || null,
          member_id: memberId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVotes(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка голосования' };
    }
  };

  useEffect(() => {
    fetchVotes();
    
    const interval = setInterval(() => {
      fetchVotes(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    votes,
    loading,
    castVote,
    fetchVotes
  };
}