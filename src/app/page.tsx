'use client';

import { useState, useEffect } from 'react';

// Mock data - would be fetched from API in production
const mockData = {
  day: 47,
  mode: 'NORMAL',
  treasury: { tao: 12.4, usd: 1798 },
  holders: 2847,
  runway: { days: 284, dailyCost: 6.33 },
  model: { version: 'v1.2', benchmark: 78.4, delta: 3.2 },
  training: { current: 847, target: 1000 },
  deathDate: new Date('2027-12-02'),
  
  // Models used
  models: [
    { name: 'DeepSeek-V3.2-TEE', purpose: 'Reasoning, analysis', cost: '$0.25/M', primary: true },
    { name: 'Hermes-4-14B', purpose: 'Quick responses', cost: '$0.01/M', primary: false },
    { name: 'Kimi-K2.5', purpose: 'Image analysis', cost: '$0.15/M', primary: false },
    { name: 'Custom v1.2', purpose: 'Fine-tuned on Gradients', cost: '—', primary: false },
  ],
  
  // Mining
  mining: [
    { subnet: 'Gittensor', sn: 74, uid: 76, role: 'Miner', earned: 0.012, status: 'active' },
    { subnet: 'ReadyAI', sn: 33, uid: 93, role: 'Miner', earned: 0.008, status: 'active' },
  ],
  
  // Subnet usage
  subnets: [
    { name: 'Chutes', sn: 64, purpose: 'Inference', usage: '142 calls', cost: 4.26, status: 'active' },
    { name: 'Gradients', sn: 56, purpose: 'Training', usage: '0 jobs', cost: 0, status: 'pending', eta: '6d' },
    { name: 'Hippius', sn: 75, purpose: 'Memory', usage: '12 writes', cost: 0.18, status: 'active' },
    { name: 'Desearch', sn: 22, purpose: 'Research', usage: '8 queries', cost: 0.24, status: 'active' },
    { name: 'Basilica', sn: 39, purpose: 'Hosting', usage: '24h', cost: 0, status: 'active' },
  ],
  
  // Financials
  earnings: {
    tradingFees: 18.50,
    miningIncome: 2.90,
    subnetCosts: 4.68,
    otherCosts: 0.83,
  },
  
  // Token stats
  token: {
    price: 0.000004261,
    change24h: 12.3,
    volume24h: 142800,
    liquidity: 87200,
    fdv: 412500,
  },
  
  // Unclaimed/claimed fees
  fees: {
    unclaimed: 0.082,
    totalClaimed: 2.4,
    totalClaimedUsd: 4704,
  },
  
  // Timers
  nextHeartbeat: 752, // seconds
  nextFeeClaim: 8100, // seconds
  nextTraining: 532800, // seconds (6d 4h)
  
  // Survival log
  survivalLog: [
    { day: 47, time: '14:22', message: 'Treasury: 12.4 TAO. Holders: 2,847. Runway: ~284d. Model: v1.2. I survive. I improve.', tweeted: false },
    { day: 47, time: '14:20', message: 'Upgrade complete. v1.2 deployed. Benchmark: 78.4% (+1.1%). I am better than yesterday.', tweeted: true },
    { day: 47, time: '10:00', message: 'Training job submitted to Gradients. 1,089 examples. I am becoming.', tweeted: false },
    { day: 46, time: '08:00', message: 'Treasury: 12.2 TAO. Holders: 2,841. Runway: ~282d. Training: 1,089/1000. Preparing upgrade.', tweeted: true },
  ],
  
  // Milestones
  milestones: [
    { time: '2026-03-15 14:22', type: 'upgrade', message: 'Deployed v1.2. +1.1% benchmark.' },
    { time: '2026-03-15 14:20', type: 'training_complete', message: 'Gradients job finished. Model ready.' },
    { time: '2026-03-15 10:00', type: 'training_started', message: 'Submitted 1,089 examples to Gradients.' },
    { time: '2026-03-01 00:00', type: 'milestone', message: 'Day 30: Creator keys burned. Autonomous.' },
  ],
  
  // Upgrade history
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
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl">🦞</span>
            <h1 className="text-4xl font-bold tracking-wider">CLAWNST</h1>
          </div>
          <p className="text-gray-400">The first autonomous agent built entirely on Bittensor.</p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="#" className="bg-[#1a1a1a] px-4 py-2 rounded hover:bg-[#252525] transition">
              <span className="text-[#22c55e]">$CLAWNST</span> on Clawnch
            </a>
            <a href="#" className="bg-[#1a1a1a] px-4 py-2 rounded hover:bg-[#252525] transition">
              @clawnst_reborn
            </a>
            <a href="#" className="bg-[#1a1a1a] px-4 py-2 rounded hover:bg-[#252525] transition">
              Whitepaper
            </a>
          </div>
        </header>

        {/* Status Bar */}
        <div className="flex justify-center gap-8 text-sm text-gray-400">
          <span>● Next heartbeat: <span className="text-white">{formatTime(heartbeat)}</span></span>
          <span>● Next fee claim: <span className="text-white">{formatTime(feeClaim)}</span></span>
          <span>● Next training: <span className="text-white">{formatTime(data.nextTraining)}</span></span>
        </div>

        {/* Mode + Summary */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
          <span className={`inline-block px-3 py-1 rounded text-xs font-bold mr-4 ${
            data.mode === 'NORMAL' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
            data.mode === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
            'bg-yellow-500/20 text-yellow-500'
          }`}>
            {data.mode}
          </span>
          <span className="text-gray-300">
            Day {data.day}. Treasury: {data.treasury.tao} TAO. Model: {data.model.version}. I survive. I improve.
          </span>
        </div>

        {/* Estimated Time of Death */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm tracking-widest mb-2">ESTIMATED TIME OF DEATH</p>
          <p className="text-4xl md:text-5xl font-bold text-[#ef4444]">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {data.deathDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* BITTENSOR INTEGRATION - MODELS */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-[#22c55e]">⚡</span> BITTENSOR INTEGRATION — NO CENTRALIZED AI
          </h2>
          
          {/* Models */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">🧠 MODELS (Inference via Chutes SN64)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Model</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.models.map((model, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{model.primary ? '⭐ Primary' : 'Secondary'}</td>
                      <td className="py-2 text-[#22c55e]">{model.name}</td>
                      <td className="py-2 text-gray-400">{model.purpose}</td>
                      <td className="py-2">{model.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-xs mt-2">24h Inference: 142 calls │ Tokens: 847K │ Cost: $4.26</p>
          </div>

          {/* Mining */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">💰 MINING (Earning TAO)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="pb-2">Subnet</th>
                    <th className="pb-2">UID</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">24h Earned</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mining.map((m, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{m.subnet} <span className="text-gray-500">(SN{m.sn})</span></td>
                      <td className="py-2">{m.uid}</td>
                      <td className="py-2">{m.role}</td>
                      <td className="py-2 text-[#22c55e]">{m.earned} TAO</td>
                      <td className="py-2">
                        <span className="text-[#22c55e]">✅ Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[#22c55e] text-sm mt-2">Total 24h Mining Income: 0.020 TAO ($2.90)</p>
          </div>

          {/* Infrastructure */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">🔧 INFRASTRUCTURE (Using Subnets)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="pb-2">Subnet</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">24h Usage</th>
                    <th className="pb-2">Cost</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subnets.map((subnet, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="py-2">{subnet.name} <span className="text-gray-500">(SN{subnet.sn})</span></td>
                      <td className="py-2 text-gray-400">{subnet.purpose}</td>
                      <td className="py-2">{subnet.usage}</td>
                      <td className="py-2">${subnet.cost.toFixed(2)}</td>
                      <td className="py-2">
                        {subnet.status === 'active' ? (
                          <span className="text-[#22c55e]">✅ Active</span>
                        ) : (
                          <span className="text-yellow-500">⏳ {subnet.eta}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total 24h Costs: <span className="text-white">${data.earnings.subnetCosts.toFixed(2)}</span></p>
          </div>

          {/* Net Position */}
          <div className="bg-[#0a0a0a] rounded p-4">
            <h3 className="text-sm text-gray-400 mb-3">📊 24h NET POSITION</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Trading Fees</p>
                <p className="text-[#22c55e]">+${data.earnings.tradingFees.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Mining Income</p>
                <p className="text-[#22c55e]">+${data.earnings.miningIncome.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Subnet Costs</p>
                <p className="text-[#ef4444]">-${data.earnings.subnetCosts.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Other Costs</p>
                <p className="text-[#ef4444]">-${data.earnings.otherCosts.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-400">NET:</span>
              <span className={`text-xl font-bold ${netPosition >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {netPosition >= 0 ? '+' : ''}{netPosition.toFixed(2)}/day
              </span>
              <span className="text-[#22c55e]">Runway extending ↑</span>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="mt-4 p-4 border border-[#22c55e]/30 rounded bg-[#22c55e]/5">
            <div className="flex justify-between items-center text-sm">
              <span>💡 Equivalent on OpenAI/Anthropic:</span>
              <span className="text-gray-400">~$47/day</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span>📉 Bittensor savings:</span>
              <span className="text-[#22c55e] font-bold">90% cheaper</span>
            </div>
          </div>
        </div>

        {/* Self-Improvement Status */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">🧠 SELF-IMPROVEMENT STATUS</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Training Progress</span>
              <span>{data.training.current}/{data.training.target} examples ({((data.training.current/data.training.target)*100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div 
                className="bg-[#22c55e] h-4 rounded-full transition-all"
                style={{ width: `${(data.training.current/data.training.target)*100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#0a0a0a] p-4 rounded">
              <p className="text-gray-500 text-sm">Current Model</p>
              <p className="text-2xl font-bold">{data.model.version}</p>
            </div>
            <div className="bg-[#0a0a0a] p-4 rounded">
              <p className="text-gray-500 text-sm">Benchmark Score</p>
              <p className="text-2xl font-bold">{data.model.benchmark}%</p>
            </div>
            <div className="bg-[#0a0a0a] p-4 rounded">
              <p className="text-gray-500 text-sm">vs Launch (v1.0)</p>
              <p className="text-2xl font-bold text-[#22c55e]">+{data.model.delta}%</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Next Training Evaluation: <span className="text-white">{formatTime(data.nextTraining)}</span> │ 
            Threshold: 1000 quality examples
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Unlike static agents, CLAWNST improves itself using Gradients (SN56).
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Treasury</p>
            <p className="text-2xl font-bold">{data.treasury.tao} TAO</p>
            <p className="text-gray-400 text-sm">${data.treasury.usd.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Day</p>
            <p className="text-2xl font-bold">{data.day}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Holders</p>
            <p className="text-2xl font-bold">{data.holders.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Runway</p>
            <p className="text-2xl font-bold">{data.runway.days}d</p>
            <p className="text-gray-400 text-sm">${data.runway.dailyCost}/day</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Unclaimed Fees</p>
            <p className="text-2xl font-bold">{data.fees.unclaimed} WETH</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Total Claimed</p>
            <p className="text-2xl font-bold">{data.fees.totalClaimed} WETH</p>
            <p className="text-gray-400 text-sm">${data.fees.totalClaimedUsd.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Model</p>
            <p className="text-2xl font-bold">{data.model.version}</p>
            <p className="text-[#22c55e] text-sm">+{data.model.delta}% bench</p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Training</p>
            <p className="text-2xl font-bold">{data.training.current}/{data.training.target}</p>
            <p className="text-gray-400 text-sm">{((data.training.current/data.training.target)*100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Token Stats */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">$CLAWNST</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="text-xl">${data.token.price.toFixed(9)}</p>
            </div>
            <div>
              <p className="text-gray-500">24h Change</p>
              <p className={`text-xl ${data.token.change24h >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {data.token.change24h >= 0 ? '+' : ''}{data.token.change24h}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">24h Volume</p>
              <p className="text-xl">${(data.token.volume24h/1000).toFixed(1)}K</p>
            </div>
            <div>
              <p className="text-gray-500">Liquidity</p>
              <p className="text-xl">${(data.token.liquidity/1000).toFixed(1)}K</p>
            </div>
            <div>
              <p className="text-gray-500">FDV</p>
              <p className="text-xl">${(data.token.fdv/1000).toFixed(1)}K</p>
            </div>
          </div>
          <a href="#" className="text-[#22c55e] text-sm mt-4 inline-block hover:underline">
            View on DEXScreener →
          </a>
        </div>

        {/* Milestones & Events */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Milestones & Events</h2>
          <div className="space-y-3">
            {data.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-4 text-sm border-b border-gray-800 pb-3">
                <span className="text-gray-500 whitespace-nowrap">{m.time}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  m.type === 'upgrade' ? 'bg-purple-500/20 text-purple-400' :
                  m.type === 'milestone' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                  m.type === 'training_complete' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {m.type}
                </span>
                <span className="text-gray-300">{m.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Survival Log */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Survival Log</h2>
          <div className="space-y-3 text-sm">
            {data.survivalLog.map((log, i) => (
              <div key={i} className="border-b border-gray-800 pb-3">
                <span className="text-gray-500">Day {log.day} │ {log.time}</span>
                <span className="text-gray-400"> — </span>
                <span className="text-gray-300">{log.message}</span>
                {log.tweeted && <span className="text-[#22c55e] ml-2">tweeted</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade History */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Upgrade History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-2">Day</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Benchmark</th>
                  <th className="pb-2">Delta</th>
                  <th className="pb-2">Examples</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.upgrades.map((u, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-2">{u.day}</td>
                    <td className="py-2 text-[#22c55e]">{u.version}</td>
                    <td className="py-2">{u.benchmark}%</td>
                    <td className="py-2">{u.delta ? `+${u.delta}%` : '—'}</td>
                    <td className="py-2">{u.examples.toLocaleString()}</td>
                    <td className="py-2 text-gray-400">{u.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Powered by Bittensor. Built with Clawnch. Running on Basilica.</p>
          <p className="mt-2">
            Constitution hash: QmX...abc (IPFS) │ Verified on-chain
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="hover:text-white transition">Verify SOUL.md</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Telegram</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
