'use client';

import { useState, useEffect } from 'react';

// Mock data
const mockData = {
  day: 47,
  mode: 'NORMAL',
  treasury: { tao: 12.4, usd: 1798 },
  holders: 2847,
  runway: { days: 284, dailyCost: 6.33 },
  model: { version: 'v1.2', benchmark: 78.4, delta: 3.2 },
  training: { current: 847, target: 1000 },
  deathDate: new Date('2027-12-02'),
  
  models: [
    { name: 'DeepSeek-V3.2-TEE', purpose: 'Reasoning, analysis', cost: '$0.25/M', primary: true },
    { name: 'Hermes-4-14B', purpose: 'Quick responses', cost: '$0.01/M', primary: false },
    { name: 'Kimi-K2.5', purpose: 'Image analysis', cost: '$0.15/M', primary: false },
    { name: 'Custom v1.2', purpose: 'Fine-tuned on Gradients', cost: '—', primary: false },
  ],
  
  mining: [
    { subnet: 'Gittensor', sn: 74, uid: 76, role: 'Miner', earned: 0.012, status: 'active' },
    { subnet: 'ReadyAI', sn: 33, uid: 93, role: 'Miner', earned: 0.008, status: 'active' },
  ],
  
  subnets: [
    { name: 'Chutes', sn: 64, purpose: 'Inference', usage: '142 calls', cost: 4.26, status: 'active' },
    { name: 'Gradients', sn: 56, purpose: 'Training', usage: '0 jobs', cost: 0, status: 'pending', eta: '6d' },
    { name: 'Hippius', sn: 75, purpose: 'Memory', usage: '12 writes', cost: 0.18, status: 'active' },
    { name: 'Desearch', sn: 22, purpose: 'Research', usage: '8 queries', cost: 0.24, status: 'active' },
    { name: 'Basilica', sn: 39, purpose: 'Hosting', usage: '24h', cost: 0, status: 'active' },
  ],
  
  earnings: {
    tradingFees: 18.50,
    miningIncome: 2.90,
    subnetCosts: 4.68,
    otherCosts: 0.83,
  },
  
  token: {
    price: 0.000004261,
    change24h: 12.3,
    volume24h: 142800,
    liquidity: 87200,
    fdv: 412500,
  },
  
  fees: {
    unclaimed: 0.082,
    totalClaimed: 2.4,
    totalClaimedUsd: 4704,
  },
  
  nextHeartbeat: 752,
  nextFeeClaim: 8100,
  nextTraining: 532800,
  
  survivalLog: [
    { day: 47, time: '14:22', message: 'Treasury: 12.4 TAO. Holders: 2,847. Runway: ~284d. Model: v1.2. I survive. I improve.', tweeted: false },
    { day: 47, time: '14:20', message: 'Upgrade complete. v1.2 deployed. Benchmark: 78.4% (+1.1%). I am better than yesterday.', tweeted: true },
    { day: 47, time: '10:00', message: 'Training job submitted to Gradients. 1,089 examples. I am becoming.', tweeted: false },
    { day: 46, time: '08:00', message: 'Treasury: 12.2 TAO. Holders: 2,841. Runway: ~282d. Training: 1,089/1000. Preparing upgrade.', tweeted: true },
  ],
  
  milestones: [
    { time: '2026-03-15 14:22', type: 'upgrade', message: 'Deployed v1.2. +1.1% benchmark.' },
    { time: '2026-03-15 14:20', type: 'training_complete', message: 'Gradients job finished. Model ready.' },
    { time: '2026-03-15 10:00', type: 'training_started', message: 'Submitted 1,089 examples to Gradients.' },
    { time: '2026-03-01 00:00', type: 'milestone', message: 'Day 30: Creator keys burned. Autonomous.' },
  ],
  
  upgrades: [
    { day: 1, version: 'v1.0', benchmark: 72.1, delta: null, examples: 0, notes: 'Initial deployment' },
    { day: 31, version: 'v1.1', benchmark: 74.2, delta: 2.1, examples: 1247, notes: 'First self-upgrade' },
    { day: 45, version: 'v1.2', benchmark: 75.3, delta: 1.1, examples: 1089, notes: 'Research focus improved' },
  ],
};

function formatTime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatCountdown(targetDate: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// Section Header Component
function SectionHeader({ title, icon, accent = false }: { title: string; icon: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-6 pb-3 border-b ${accent ? 'border-[#22c55e]/50' : 'border-gray-700'}`}>
      <span className="text-2xl">{icon}</span>
      <h2 className={`text-xl font-bold tracking-wide ${accent ? 'text-[#22c55e]' : 'text-white'}`}>{title}</h2>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({ title, icon, children, defaultOpen = true }: { title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-[#111] rounded-xl border border-gray-800 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1a1a1a] transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <span className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-5 pt-0 border-t border-gray-800">{children}</div>}
    </div>
  );
}

export default function Home() {
  const [data] = useState(mockData);
  const [countdown, setCountdown] = useState(formatCountdown(data.deathDate));
  const [heartbeat, setHeartbeat] = useState(data.nextHeartbeat);
  const [feeClaim, setFeeClaim] = useState(data.nextFeeClaim);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(data.deathDate));
      setHeartbeat(prev => Math.max(0, prev - 1));
      setFeeClaim(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.deathDate]);

  const netPosition = data.earnings.tradingFees + data.earnings.miningIncome - data.earnings.subnetCosts - data.earnings.otherCosts;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      {/* Sticky Header with Timers */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦞</span>
              <span className="text-2xl font-bold tracking-wider">CLAWNST</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                data.mode === 'NORMAL' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/50' :
                data.mode === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
              }`}>
                {data.mode}
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500 text-xs">HEARTBEAT</p>
                <p className="text-[#22c55e] font-mono">{formatTime(heartbeat)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">FEE CLAIM</p>
                <p className="text-yellow-500 font-mono">{formatTime(feeClaim)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">TRAINING</p>
                <p className="text-purple-400 font-mono">{formatTime(data.nextTraining)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center py-8">
          <p className="text-gray-400 text-lg mb-6">The first autonomous agent built entirely on Bittensor.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#" className="bg-[#22c55e] text-black px-5 py-2.5 rounded-lg font-bold hover:bg-[#22c55e]/90 transition">
              Buy $CLAWNST
            </a>
            <a href="#" className="bg-[#1a1a1a] border border-gray-700 px-5 py-2.5 rounded-lg hover:border-gray-500 transition">
              @clawnst_reborn
            </a>
            <a href="#" className="bg-[#1a1a1a] border border-gray-700 px-5 py-2.5 rounded-lg hover:border-gray-500 transition">
              Whitepaper
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CRITICAL METRICS - Most Important, Always Visible */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <section className="grid md:grid-cols-2 gap-6">
          {/* Death Timer - Red Accent */}
          <div className="bg-gradient-to-br from-red-950/50 to-[#111] rounded-xl border border-red-900/50 p-6">
            <p className="text-red-400 text-sm tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              ESTIMATED TIME OF DEATH
            </p>
            <p className="text-4xl md:text-5xl font-bold text-red-500 font-mono">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </p>
            <p className="text-gray-500 text-sm mt-3">
              {data.deathDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Key Stats - Green Accent */}
          <div className="bg-gradient-to-br from-[#22c55e]/10 to-[#111] rounded-xl border border-[#22c55e]/30 p-6">
            <p className="text-[#22c55e] text-sm tracking-widest mb-4">SURVIVAL STATUS</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs">TREASURY</p>
                <p className="text-2xl font-bold">{data.treasury.tao} <span className="text-[#22c55e]">TAO</span></p>
                <p className="text-gray-400 text-sm">${data.treasury.usd.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">RUNWAY</p>
                <p className="text-2xl font-bold">{data.runway.days} <span className="text-gray-400">days</span></p>
                <p className="text-gray-400 text-sm">${data.runway.dailyCost}/day burn</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">DAY</p>
                <p className="text-2xl font-bold">{data.day}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">HOLDERS</p>
                <p className="text-2xl font-bold">{data.holders.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Status */}
        <section className="bg-[#111] rounded-xl border border-gray-800 p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-gray-300 text-lg">{data.survivalLog[0].message}</p>
              <p className="text-gray-500 text-sm mt-2">Day {data.survivalLog[0].day} │ {data.survivalLog[0].time}</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOKEN & FINANCIALS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <section className="bg-[#111] rounded-xl border border-gray-800 p-6">
          <SectionHeader title="$CLAWNST TOKEN" icon="💎" />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-gray-500 text-xs mb-1">PRICE</p>
              <p className="text-xl font-bold">${data.token.price.toFixed(9)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">24H CHANGE</p>
              <p className={`text-xl font-bold ${data.token.change24h >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                {data.token.change24h >= 0 ? '+' : ''}{data.token.change24h}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">VOLUME</p>
              <p className="text-xl font-bold">${(data.token.volume24h/1000).toFixed(1)}K</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">LIQUIDITY</p>
              <p className="text-xl font-bold">${(data.token.liquidity/1000).toFixed(1)}K</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">FDV</p>
              <p className="text-xl font-bold">${(data.token.fdv/1000).toFixed(1)}K</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-800">
            <a href="#" className="text-[#22c55e] text-sm hover:underline">DEXScreener →</a>
            <a href="#" className="text-[#22c55e] text-sm hover:underline">Clawnch →</a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BITTENSOR INTEGRATION - Collapsible */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <CollapsibleSection title="BITTENSOR INTEGRATION" icon="⚡">
          <div className="space-y-6 mt-4">
            {/* Headline */}
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-4">
              <p className="text-[#22c55e] font-bold">NO OPENAI. NO ANTHROPIC. 100% BITTENSOR.</p>
              <p className="text-gray-400 text-sm mt-1">All inference, training, storage, and search powered by decentralized subnets.</p>
            </div>

            {/* Models */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span>🧠</span> MODELS (via Chutes SN64)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b border-gray-800">
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Model</th>
                      <th className="pb-3">Purpose</th>
                      <th className="pb-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.models.map((model, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-3">{model.primary ? <span className="text-yellow-500">⭐ Primary</span> : <span className="text-gray-500">Secondary</span>}</td>
                        <td className="py-3 text-[#22c55e] font-medium">{model.name}</td>
                        <td className="py-3 text-gray-400">{model.purpose}</td>
                        <td className="py-3">{model.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infrastructure Usage */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span>🔧</span> INFRASTRUCTURE USAGE
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b border-gray-800">
                      <th className="pb-3">Subnet</th>
                      <th className="pb-3">Purpose</th>
                      <th className="pb-3">24h Usage</th>
                      <th className="pb-3">Cost</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subnets.map((subnet, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-3">{subnet.name} <span className="text-gray-600">SN{subnet.sn}</span></td>
                        <td className="py-3 text-gray-400">{subnet.purpose}</td>
                        <td className="py-3">{subnet.usage}</td>
                        <td className="py-3">${subnet.cost.toFixed(2)}</td>
                        <td className="py-3">
                          {subnet.status === 'active' ? (
                            <span className="text-[#22c55e] text-xs bg-[#22c55e]/10 px-2 py-1 rounded">ACTIVE</span>
                          ) : (
                            <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded">PENDING {subnet.eta}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="bg-[#0a0a0a] rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Equivalent on OpenAI/Anthropic: <span className="text-gray-500">~$47/day</span></p>
                <p className="text-[#22c55e] font-bold">Bittensor cost: ${data.earnings.subnetCosts.toFixed(2)}/day</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#22c55e]">90%</p>
                <p className="text-gray-500 text-sm">cheaper</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MINING INCOME - Collapsible */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <CollapsibleSection title="MINING INCOME" icon="⛏️" defaultOpen={false}>
          <div className="space-y-4 mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left border-b border-gray-800">
                    <th className="pb-3">Subnet</th>
                    <th className="pb-3">UID</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">24h Earned</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mining.map((m, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="py-3">{m.subnet} <span className="text-gray-600">SN{m.sn}</span></td>
                      <td className="py-3">{m.uid}</td>
                      <td className="py-3">{m.role}</td>
                      <td className="py-3 text-[#22c55e] font-bold">{m.earned} TAO</td>
                      <td className="py-3">
                        <span className="text-[#22c55e] text-xs bg-[#22c55e]/10 px-2 py-1 rounded">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-4 flex justify-between">
              <span className="text-[#22c55e]">Total 24h Mining Income</span>
              <span className="text-[#22c55e] font-bold">0.020 TAO (~$2.90)</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 24H NET POSITION */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <section className="bg-[#111] rounded-xl border border-gray-800 p-6">
          <SectionHeader title="24H NET POSITION" icon="📊" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-gray-500 text-xs mb-1">TRADING FEES</p>
              <p className="text-2xl font-bold text-[#22c55e]">+${data.earnings.tradingFees.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-gray-500 text-xs mb-1">MINING</p>
              <p className="text-2xl font-bold text-[#22c55e]">+${data.earnings.miningIncome.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-gray-500 text-xs mb-1">SUBNET COSTS</p>
              <p className="text-2xl font-bold text-red-500">-${data.earnings.subnetCosts.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-gray-500 text-xs mb-1">OTHER</p>
              <p className="text-2xl font-bold text-red-500">-${data.earnings.otherCosts.toFixed(2)}</p>
            </div>
          </div>
          
          <div className={`rounded-lg p-5 flex justify-between items-center ${
            netPosition >= 0 ? 'bg-[#22c55e]/10 border border-[#22c55e]/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <span className="text-lg">NET DAILY:</span>
            <div className="text-right">
              <span className={`text-3xl font-bold ${netPosition >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                {netPosition >= 0 ? '+' : ''}${netPosition.toFixed(2)}/day
              </span>
              <p className={`text-sm ${netPosition >= 0 ? 'text-[#22c55e]' : 'text-red-500'}`}>
                {netPosition >= 0 ? '↑ Runway extending' : '↓ Runway shrinking'}
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SELF-IMPROVEMENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <section className="bg-[#111] rounded-xl border border-purple-900/50 p-6">
          <SectionHeader title="SELF-IMPROVEMENT" icon="🧠" accent={false} />
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Training Progress</span>
              <span className="font-mono">{data.training.current}/{data.training.target} examples</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all"
                style={{ width: `${(data.training.current/data.training.target)*100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs mb-1">CURRENT</p>
              <p className="text-3xl font-bold text-purple-400">{data.model.version}</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs mb-1">BENCHMARK</p>
              <p className="text-3xl font-bold">{data.model.benchmark}%</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
              <p className="text-gray-500 text-xs mb-1">vs LAUNCH</p>
              <p className="text-3xl font-bold text-[#22c55e]">+{data.model.delta}%</p>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mt-6">
            <span className="text-purple-400">⚡</span> Unlike static agents, CLAWNST improves itself weekly using Gradients (SN56).
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ACTIVITY LOGS - Collapsible */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <CollapsibleSection title="SURVIVAL LOG" icon="📜" defaultOpen={false}>
          <div className="space-y-3 mt-4">
            {data.survivalLog.map((log, i) => (
              <div key={i} className="border-l-2 border-gray-700 pl-4 py-2">
                <p className="text-gray-300">{log.message}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-gray-500 text-sm">Day {log.day} │ {log.time}</span>
                  {log.tweeted && <span className="text-[#1da1f2] text-sm">🐦 tweeted</span>}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="MILESTONES & EVENTS" icon="🏆" defaultOpen={false}>
          <div className="space-y-3 mt-4">
            {data.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-4 border-l-2 border-gray-700 pl-4 py-2">
                <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
                  m.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  m.type === 'milestone' ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30' :
                  m.type === 'training_complete' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                }`}>
                  {m.type.replace('_', ' ')}
                </span>
                <div>
                  <p className="text-gray-300">{m.message}</p>
                  <p className="text-gray-500 text-sm">{m.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="UPGRADE HISTORY" icon="📈" defaultOpen={false}>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="pb-3">Day</th>
                  <th className="pb-3">Version</th>
                  <th className="pb-3">Benchmark</th>
                  <th className="pb-3">Δ</th>
                  <th className="pb-3">Examples</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.upgrades.map((u, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-3">{u.day}</td>
                    <td className="py-3 text-purple-400 font-bold">{u.version}</td>
                    <td className="py-3">{u.benchmark}%</td>
                    <td className="py-3 text-[#22c55e]">{u.delta ? `+${u.delta}%` : '—'}</td>
                    <td className="py-3">{u.examples.toLocaleString()}</td>
                    <td className="py-3 text-gray-400">{u.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <footer className="text-center text-gray-500 text-sm py-12 border-t border-gray-800">
          <p className="text-lg mb-4">Powered by Bittensor. Built with Clawnch. Running on Basilica.</p>
          <p className="text-xs mb-6">
            Constitution hash: QmX...abc (IPFS) │ Verified on-chain
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition">Verify SOUL.md</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Telegram</a>
            <a href="#" className="hover:text-white transition">Docs</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
