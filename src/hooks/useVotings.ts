import { useState, useEffect } from 'react';
import { useNotifications } from './useNotifications';

interface Vote {
  member_id: string;
  vote_value: boolean;
  created_at: string;
}

interface VotingOption {
  id: string;
  option_text: string;
  description?: string;
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  votes?: Vote[];
}

interface Voting {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  voting_type: 'meal' | 'rule' | 'general';
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  options: VotingOption[];
}

const VOTINGS_API = 'https://functions.poehali.dev/af463fd6-2a6f-4b47-9d37-8967f1750af4';

export function useVotings(status?: 'active' | 'completed') {
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifyVotingCreated } = useNotifications();

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchVotings = async (silent = false) => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      
      const url = status 
        ? `${VOTINGS_API}?status=${status}`
        : VOTINGS_API;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки голосований');
      }

      const data = await response.json();
      
      if (data.success && data.votings) {
        setVotings(data.votings);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки');
        setVotings([]);
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      setVotings([]);
    } finally {
      setLoading(false);
    }
  };

  const createVoting = async (votingData: {
    title: string;
    description?: string;
    voting_type: 'meal' | 'rule' | 'general';
    end_date: string;
    options?: { text: string; description?: string }[];
  }) => {
    try {
      const response = await fetch(VOTINGS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'create',
          ...votingData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVotings();
        notifyVotingCreated(votingData.title, data.voting_id);
        return { success: true, voting_id: data.voting_id };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка создания голосования' };
    }
  };

  const castVote = async (votingId: string, optionId: string, voteValue: boolean) => {
    try {
      const response = await fetch(VOTINGS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'vote',
          voting_id: votingId,
          option_id: optionId,
          vote_value: voteValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVotings(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка голосования' };
    }
  };

  const deleteVoting = async (votingId: string) => {
    try {
      const response = await fetch(VOTINGS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'delete',
          voting_id: votingId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchVotings(true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка удаления голосования' };
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchVotings();
      
      const interval = setInterval(() => {
        fetchVotings(true);
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [status]);

  return {
    votings,
    loading,
    error,
    fetchVotings,
    createVoting,
    castVote,
    deleteVoting
  };
}