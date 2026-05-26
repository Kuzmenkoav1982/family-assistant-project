import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { useFamilyRules } from '@/components/family-rules/useFamilyRules';
import RuleInstructionPanel from '@/components/family-rules/RuleInstructionPanel';
import RuleFormDialog from '@/components/family-rules/RuleFormDialog';
import VotingRuleCard from '@/components/family-rules/VotingRuleCard';
import ApprovedRuleCard from '@/components/family-rules/ApprovedRuleCard';

export default function FamilyRules() {
  const {
    isDialogOpen, setIsDialogOpen,
    newRuleTitle, setNewRuleTitle,
    newRuleDescription, setNewRuleDescription,
    newRuleCategory, setNewRuleCategory,
    currentUser, currentUserData,
    approvedRules, votingRules,
    handleCreateRule, handleVote, handleDeleteRule,
    categories,
  } = useFamilyRules();

  return (
    <>
      <SEOHead
        title="Правила дома — семейные договорённости"
        description="Создайте правила вашего дома: распорядок дня, обязанности, правила поведения. Договорённости, которые соблюдает вся семья."
        path="/rules"
      />
      <SectionPageFrame
        title="Правила дома"
        subtitle="Семейный кодекс и договорённости"
        backPath="/values-hub"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d7eab07b-1925-4bdb-a7ad-9009ba37cd4a.jpg"
        backgroundClass="bg-gradient-to-b from-purple-50 via-purple-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
      >

          <RuleInstructionPanel />

          <Card className="border-2 border-indigo-200 bg-indigo-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="Scale" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Как работают семейные правила?</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Владелец и Администратор</strong> могут добавлять правила единолично — они вступают в силу сразу.</p>
                    <p><strong>Любой член семьи</strong> может предложить новое правило на голосование. Правило принимается, если ЗА проголосуют все остальные участники.</p>
                    <p><strong>Правила обязательны</strong> для всех членов семьи и помогают избежать конфликтов.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {approvedRules.length} утверждено
              </Badge>
              {votingRules.length > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {votingRules.length} на голосовании
                </Badge>
              )}
            </div>
            <RuleFormDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              categories={categories}
              newRuleTitle={newRuleTitle}
              setNewRuleTitle={setNewRuleTitle}
              newRuleDescription={newRuleDescription}
              setNewRuleDescription={setNewRuleDescription}
              newRuleCategory={newRuleCategory}
              setNewRuleCategory={setNewRuleCategory}
              currentUserData={currentUserData}
              onSubmit={handleCreateRule}
            />
          </div>

          {votingRules.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Vote" size={22} className="text-amber-600" />
                На голосовании
              </h2>
              <div className="space-y-4">
                {votingRules.map((rule) => (
                  <VotingRuleCard
                    key={rule.id}
                    rule={rule}
                    currentUser={currentUser}
                    canApproveAlone={currentUserData?.canApproveAlone}
                    onVote={handleVote}
                    onDelete={handleDeleteRule}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="ShieldCheck" size={22} className="text-green-600" />
              Действующие правила
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {approvedRules.map((rule) => (
                <ApprovedRuleCard
                  key={rule.id}
                  rule={rule}
                  canApproveAlone={currentUserData?.canApproveAlone}
                  onDelete={handleDeleteRule}
                />
              ))}
            </div>
          </div>
      </SectionPageFrame>
    </>
  );
}