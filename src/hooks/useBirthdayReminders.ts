import { useEffect } from 'react';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useNotifications } from './useNotifications';

export function useBirthdayReminders() {
  const { members } = useFamilyMembersContext();
  const { notifyBirthday } = useNotifications();

  useEffect(() => {
    const checkBirthdays = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      members.forEach(member => {
        if (!member.age && !member.birthDate) return;

        let birthDate: Date | null = null;
        
        if (member.birthDate) {
          birthDate = new Date(member.birthDate);
        }

        if (!birthDate || isNaN(birthDate.getTime())) return;

        const birthdayThisYear = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );

        const todayStr = `${today.getDate()}-${today.getMonth()}`;
        const tomorrowStr = `${tomorrow.getDate()}-${tomorrow.getMonth()}`;
        const birthdayStr = `${birthdayThisYear.getDate()}-${birthdayThisYear.getMonth()}`;

        const notificationKey = `birthday_notif_${member.id}_${today.getFullYear()}`;
        const alreadyNotified = localStorage.getItem(notificationKey);

        if (birthdayStr === tomorrowStr && !alreadyNotified) {
          notifyBirthday(member.name, true);
          localStorage.setItem(notificationKey, 'tomorrow');
        }

        if (birthdayStr === todayStr && alreadyNotified !== 'today') {
          notifyBirthday(member.name, false);
          localStorage.setItem(notificationKey, 'today');
        }
      });
    };

    checkBirthdays();
    const interval = setInterval(checkBirthdays, 3600000);

    return () => clearInterval(interval);
  }, [members, notifyBirthday]);
}
