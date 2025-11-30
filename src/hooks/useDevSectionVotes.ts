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
    setLoading(false);
  };

  const castVote = async (sectionId: string, voteType: 'up' | 'down', comment?: string) => {
    return { success: true };
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    votes,
    loading,
    castVote,
    fetchVotes
  };
}