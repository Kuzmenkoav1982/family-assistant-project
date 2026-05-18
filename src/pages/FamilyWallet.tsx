import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import WalletInstructions from '@/components/wallet/WalletInstructions';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletTopupForm from '@/components/wallet/WalletTopupForm';
import WalletOverview from '@/components/wallet/WalletOverview';
import WalletHistory from '@/components/wallet/WalletHistory';
import { useWallet } from '@/components/wallet/useWallet';

export default function FamilyWallet() {
  const [showTopup, setShowTopup] = useState(false);
  const [tab, setTab] = useState<'overview' | 'history'>('overview');
  const { loading, balance, transactions, stats, showSuccess, topup } = useWallet();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Семейный кошелёк — баланс и операции"
        description="Баланс семейного кошелька, история операций, пополнение счёта для использования ИИ-сервисов."
        path="/wallet"
      />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">

          <SectionHero
            title="Семейный кошелёк"
            subtitle="Баланс для ИИ-сервисов"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b500a1d4-8384-41cc-8a43-8eb7210924e8.jpg"
            backPath="/nutrition"
          />

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

        </div>
      </div>
    </>
  );
}
