/**
 * Включение геолокации ребёнка: последовательность независимых шагов.
 *
 * Три сущности, которые НЕЛЬЗЯ смешивать, и здесь они разведены по шагам:
 *
 *   1. Представительство — кто вправе принять решение за ребёнка.
 *   2. Согласие на сбор  — разрешено ли системе собирать местоположение.
 *   3. Разрешение получателю — кто конкретно может его видеть.
 *
 * Пройденный шаг 1 ничего не включает: он не запускает GPS, не создаёт
 * согласия, не выдаёт geolocation:read и не делает заявителя получателем
 * координат. Иначе одна галочка незаметно включала бы слежение за ребёнком.
 *
 * Нулевой шаг — дата рождения: пока возраст неизвестен, определить, кто
 * вправе давать согласие, невозможно, и функция не включается.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import useLegalRepresentative from '@/hooks/useLegalRepresentative';
import useLocationConsent from '@/hooks/useLocationConsent';
import useFamilyTracker from '@/hooks/useFamilyTracker';
import RepresentativeDeclarationDialog from '@/components/family-tracker/RepresentativeDeclarationDialog';
import BirthDateRequiredDialog from '@/components/family-tracker/BirthDateRequiredDialog';
import LocationConsentDialog from '@/components/family-tracker/LocationConsentDialog';
import func2url from '../../backend/func2url.json';

const MEMBERS_URL = (func2url as Record<string, string>)['family-members'];

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('auth_token') || '';
}

export default function ChildLocationSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const subjectId = params.get('member_id') || '';

  const rep = useLegalRepresentative(subjectId);
  const consent = useLocationConsent(subjectId || undefined);
  const t = useFamilyTracker();

  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [savingBirthDate, setSavingBirthDate] = useState(false);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);

  const ageKnown = rep.status?.subject_age != null;
  const declared = rep.hasDeclared;
  const consentGiven = Boolean(consent.status?.consent?.valid);

  const recipientOptions = useMemo(
    () => t.familyMembers
      .filter((m) => m.id !== subjectId)
      .map((m) => ({ id: m.id, name: m.name })),
    [t.familyMembers, subjectId],
  );

  /** Дата рождения сохраняется на сервере; возраст пересчитает он же. */
  const handleSaveBirthDate = async (birthDate: string) => {
    if (!MEMBERS_URL || !subjectId) return;
    setSavingBirthDate(true);
    setBirthDateError(null);
    try {
      const res = await fetch(MEMBERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
        body: JSON.stringify({ id: subjectId, birthDate }),
      });
      if (res.ok) {
        setBirthDateOpen(false);
        await rep.reload();
        await consent.reload();
      } else {
        const body = await res.json().catch(() => ({}));
        setBirthDateError(body?.error
          || 'Не удалось сохранить дату рождения. Возможно, у вас нет на это права.');
      }
    } catch {
      setBirthDateError('Нет соединения с сервером.');
    } finally {
      setSavingBirthDate(false);
    }
  };

  /** Успех заявления открывает следующий экран — и ничего не включает. */
  const handleDeclare = async () => {
    const ok = await rep.declare();
    if (!ok) return;
    setDeclarationOpen(false);
    await consent.reload();
  };

  const handleAcceptConsent = async (p: {
    retentionDays: number; recipients: string[]; background: boolean;
  }) => {
    const saved = await consent.grant(p);
    if (!saved) return;
    setConsentOpen(false);
  };

  const steps = [
    {
      n: 1,
      title: 'Дата рождения участника',
      done: ageKnown,
      body: ageKnown
        ? `Указана: ${rep.status?.subject_age} лет. От возраста зависит, кто вправе дать согласие.`
        : 'Пока возраст неизвестен, определить порядок согласия невозможно, и функция не включается.',
      action: ageKnown ? null : (
        <Button onClick={() => setBirthDateOpen(true)}>Указать дату рождения</Button>
      ),
    },
    {
      n: 2,
      title: 'Заявление о законном представительстве',
      done: declared,
      body: declared
        ? 'Вы заявили, что являетесь законным представителем этого ребёнка. Платформа сохранила заявление, но не проверяла его по государственным реестрам.'
        : 'Роли «родитель», «владелец» и «администратор» представительства не подтверждают. Требуется отдельное заявление.',
      action: !ageKnown ? null : declared ? (
        <Button
          variant="outline"
          className="text-red-600"
          disabled={rep.submitting}
          onClick={() => rep.revoke()}
        >
          Отозвать заявление
        </Button>
      ) : (
        <Button onClick={() => setDeclarationOpen(true)}>
          Подтвердить представительство
        </Button>
      ),
    },
    {
      n: 3,
      title: 'Согласие на обработку геоданных',
      done: consentGiven,
      body: consentGiven
        ? 'Согласие записано. Управлять передачей и получателями можно в «Семейном маячке».'
        : 'Отдельное решение: разрешено ли системе собирать местоположение ребёнка и на каких условиях.',
      action: declared && !consentGiven ? (
        <Button onClick={() => setConsentOpen(true)}>Перейти к согласию</Button>
      ) : consentGiven ? (
        <Button variant="outline" onClick={() => navigate('/family-tracker')}>
          Кто видит местоположение
        </Button>
      ) : null,
    },
  ];

  return (
    <>
      <SEOHead
        title="Подтверждение полномочий представителя"
        description="Заявление о законном представительстве ребёнка перед включением передачи местоположения."
        path="/child-location-setup"
      />
      <SectionPageFrame
        title="Передача местоположения ребёнка"
        subtitle="Полномочия, согласие и получатели — три отдельных решения"
        backPath="/family-tracker"
        backgroundClass="bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:from-gray-950 dark:to-gray-900"
      >
        {!subjectId && (
          <Card>
            <CardContent className="p-5 text-sm text-gray-700">
              Не выбран участник. Вернитесь в «Семейный маячок» и выберите
              ребёнка, для которого настраиваете передачу местоположения.
            </CardContent>
          </Card>
        )}

        {subjectId && (
          <>
            <Card className="border-blue-200 bg-blue-50 shadow-md">
              <CardContent className="flex items-start gap-4 p-5">
                <Icon name="Info" size={22} className="mt-0.5 flex-shrink-0 text-blue-600" />
                <div className="space-y-2 text-sm text-blue-900">
                  <p className="font-semibold">
                    Заявление — не проверка
                  </p>
                  <p>
                    Платформа сохраняет ваше заявление о том, что вы законный
                    представитель, но не проверяет его по документам и
                    государственным реестрам. Ни один шаг здесь не включает
                    передачу местоположения автоматически.
                  </p>
                </div>
              </CardContent>
            </Card>

            {steps.map((s) => (
              <Card key={s.n} className="shadow-md">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      s.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {s.done ? <Icon name="Check" size={18} /> : s.n}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      {s.n === 2 && declared && (
                        /* Статус называется своим именем. Слово
                           «проверено» здесь не появляется никогда. */
                        <Badge className="border border-amber-300 bg-amber-100 text-amber-900">
                          Заявлено пользователем, не проверено
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{s.body}</p>
                    {s.action}
                  </div>
                </CardContent>
              </Card>
            ))}

            {(rep.status?.other_declarations?.length ?? 0) > 0 && (
              <Card className="shadow-md">
                <CardContent className="p-5">
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                    Другие заявления об этом ребёнке
                  </p>
                  <p className="mb-3 text-xs text-gray-600">
                    У ребёнка может быть несколько представителей. Каждый
                    заявляет за себя: изменить или отозвать чужое заявление
                    нельзя, и наличие нескольких заявлений не расширяет список
                    получателей координат.
                  </p>
                  <div className="space-y-2">
                    {rep.status?.other_declarations.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm"
                      >
                        <span className="text-gray-900">
                          {d.representative_name || 'Участник'}
                        </span>
                        <Badge variant="outline">
                          {d.status === 'revoked' ? 'заявление отозвано' : 'заявлено, не проверено'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <BirthDateRequiredDialog
          open={birthDateOpen}
          memberName={rep.status?.subject_name || 'участника'}
          isSelf={false}
          submitting={savingBirthDate}
          error={birthDateError}
          onCancel={() => setBirthDateOpen(false)}
          onSave={handleSaveBirthDate}
        />

        <RepresentativeDeclarationDialog
          open={declarationOpen}
          status={rep.status}
          submitting={rep.submitting}
          error={rep.error}
          onCancel={() => setDeclarationOpen(false)}
          onConfirm={handleDeclare}
          onRequestBirthDate={() => { setDeclarationOpen(false); setBirthDateOpen(true); }}
        />

        <LocationConsentDialog
          open={consentOpen}
          subjectName={rep.status?.subject_name || 'участника'}
          isSelf={false}
          eligibility={consent.status?.eligibility || null}
          consentText={consent.status?.consent_text || null}
          recipientOptions={recipientOptions}
          submitting={consent.submitting}
          error={consent.error}
          onCancel={() => setConsentOpen(false)}
          onAccept={handleAcceptConsent}
        />
      </SectionPageFrame>
    </>
  );
}
