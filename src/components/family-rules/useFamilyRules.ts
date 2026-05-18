import { useState } from 'react';
import type { FamilyRule } from './types';
import { RULE_CATEGORIES, FAMILY_MEMBERS } from './types';

const MOCK_RULES: FamilyRule[] = [];

export function useFamilyRules() {
  const [rules, setRules] = useState<FamilyRule[]>(() => {
    const saved = localStorage.getItem('familyRules');
    if (saved) {
      try { return JSON.parse(saved); } catch { return MOCK_RULES; }
    }
    return MOCK_RULES;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Общие');
  const [currentUser] = useState('Пользователь');

  const currentUserData = FAMILY_MEMBERS.find(m => m.name === currentUser);
  const approvedRules = rules.filter(r => r.status === 'approved');
  const votingRules = rules.filter(r => r.status === 'voting');
  const rejectedRules = rules.filter(r => r.status === 'rejected');

  const handleCreateRule = () => {
    if (!newRuleTitle || !newRuleDescription) return;
    const newRule: FamilyRule = {
      id: String(rules.length + 1),
      title: newRuleTitle,
      description: newRuleDescription,
      author: currentUser,
      createdDate: 'только что',
      status: currentUserData?.canApproveAlone ? 'approved' : 'voting',
      votes: currentUserData?.canApproveAlone ? undefined : {
        for: [currentUser],
        against: [],
        required: FAMILY_MEMBERS.length - 1
      },
      category: newRuleCategory
    };
    const updatedRules = [newRule, ...rules];
    setRules(updatedRules);
    localStorage.setItem('familyRules', JSON.stringify(updatedRules));
    setNewRuleTitle('');
    setNewRuleDescription('');
    setNewRuleCategory('Общие');
    setIsDialogOpen(false);
  };

  const handleVote = (ruleId: string, vote: 'for' | 'against') => {
    const updatedRules = rules.map(rule => {
      if (rule.id !== ruleId || !rule.votes) return rule;
      const alreadyVoted = rule.votes.for.includes(currentUser) || rule.votes.against.includes(currentUser);
      if (alreadyVoted) return rule;
      const updatedVotes = { ...rule.votes, [vote]: [...rule.votes[vote], currentUser] };
      const totalVotes = updatedVotes.for.length + updatedVotes.against.length;
      const approvedVotes = updatedVotes.for.length;
      return {
        ...rule,
        votes: updatedVotes,
        status: totalVotes >= updatedVotes.required
          ? (approvedVotes >= updatedVotes.required ? 'approved' : 'rejected')
          : 'voting'
      };
    });
    setRules(updatedRules);
    localStorage.setItem('familyRules', JSON.stringify(updatedRules));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Удалить это правило?')) {
      const updatedRules = rules.filter(r => r.id !== ruleId);
      setRules(updatedRules);
      localStorage.setItem('familyRules', JSON.stringify(updatedRules));
    }
  };

  return {
    rules, isDialogOpen, setIsDialogOpen,
    newRuleTitle, setNewRuleTitle,
    newRuleDescription, setNewRuleDescription,
    newRuleCategory, setNewRuleCategory,
    currentUser, currentUserData,
    approvedRules, votingRules, rejectedRules,
    handleCreateRule, handleVote, handleDeleteRule,
    categories: RULE_CATEGORIES,
  };
}
