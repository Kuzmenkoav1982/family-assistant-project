import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { HealthProfile } from '@/types/health';

interface ProfileSelectorProps {
  profiles: HealthProfile[];
  selectedProfile: HealthProfile | null;
  onSelect: (profile: HealthProfile) => void;
  getMemberPhoto: (profile: HealthProfile) => string | null;
}

export default function ProfileSelector({ profiles, selectedProfile, onSelect, getMemberPhoto }: ProfileSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {profiles.map((profile) => {
        const photo = getMemberPhoto(profile);
        return (
          <Card
            key={profile.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProfile?.id === profile.id ? 'border-primary border-2' : ''
            }`}
            onClick={() => onSelect(profile)}
          >
            <CardContent className="pt-4 md:pt-6 text-center">
              {photo ? (
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img src={photo} alt={profile.userName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-3xl md:text-4xl mb-2">
                  {profile.userAge < 13 ? '\u{1F466}' : profile.userAge < 18 ? '\u{1F467}' : profile.userName === '\u0410\u043d\u0430\u0441\u0442\u0430\u0441\u0438\u044f' ? '\u{1F469}' : '\u{1F468}'}
                </div>
              )}
              <h3 className="font-semibold text-sm md:text-base">{profile.userName}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{profile.userAge} лет</p>
              <div className="mt-1 md:mt-2 flex justify-center gap-1">
                {profile.privacy === 'private' && <Icon name="Lock" size={12} className="text-muted-foreground" />}
                {profile.privacy === 'parents' && <Icon name="Users" size={12} className="text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
