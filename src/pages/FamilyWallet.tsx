import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import WalletInstructions from '@/components/wallet/WalletInstructions';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTopupForm from '@/components/wallet/WalletTopupForm';
import WalletOverview from '@/components/wallet/WalletOverview';
import WalletHistory from '@/components/wallet/WalletHistory';
import { useWallet } from '@/components/wallet/useWallet';

const WALLET_IMAGE = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d19aef74-77ba-4fc2-8710-3fbba53c5da8.jpg';
const BG = 'bg-gradient-to-b from-emerald-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900';

export default function FamilyWallet() {
  const [showTopup, setShowTopup] = useState(false);
  const [tab, setTab] = useState<'overview' | 'history'>('overview');
  const { loading, balance, transactions, stats, showSuccess, topup } = useWallet();

  if (loading) {
    return (
      <SectionPageFrame
        title="Семейный кошелёк"
        backPath="/finance"
        variant="light"
        backgroundClass={BG}
      >
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SectionPageFrame>
    );
  }

  return (
    <>
      <SEOHead
        title="Семейный кошелёк — баланс и операции"
        description="Баланс семейного кошелька, история операций, пополнение счёта для использования ИИ-сервисов."
        path="/wallet"
      />
      <SectionPageFrame
        title="Семейный кошелёк"
        subtitle="Баланс для ИИ-сервисов"
        backPath="/finance"
        imageUrl={WALLET_IMAGE}
        width="narrow"
        backgroundClass={BG}
      >
        <WalletInstructions />

        {showSuccess && (
          <Card className="border-green-300 bg-green-50 animate-fade-in">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="Check" size={24} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-green-800">Оплата прошла успешно!</p>
                <p className="text-sm text-green-700">Средства скоро поступят на баланс</p>
              </div>
            </CardContent>
          </Card>
        )}

        <WalletBalanceCard
          balance={balance}
          onTopup={() => setShowTopup(true)}
          onToggleHistory={() => setTab(tab === 'history' ? 'overview' : 'history')}
        />

        {showTopup && (
          <WalletTopupForm
            onClose={() => setShowTopup(false)}
            onSubmit={topup}
          />
        )}

        {tab === 'overview' && (
          <WalletOverview
            stats={stats}
            transactions={transactions}
            onShowHistory={() => setTab('history')}
            onShowTopup={() => setShowTopup(true)}
          />
        )}

        {tab === 'history' && (
          <WalletHistory
            transactions={transactions}
            onBack={() => setTab('overview')}
          />
        )}
      </SectionPageFrame>
    </>
  );
}