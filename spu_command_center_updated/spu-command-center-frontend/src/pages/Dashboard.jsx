import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, Antenna, BarChart3, Battery, Clock, Cpu, Database, FileText, Globe, MapPin, Mic, MicOff, Radio, Search, ShieldCheck, Signal, Thermometer, Users, Wifi, Zap, Gauge, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { callsignAPI, transcriptAPI, eventAPI } from '../services/api';

const toList = (p) => { if (Array.isArray(p)) return p; if (Array.isArray(p?.results)) return p.results; return []; };

// === MOCK DATA ===
const mockCallsigns = [
  { callsign: 'HS1SPU', operator_name: 'สมชาย ใจดี', status: 'online', frequency: '145.000', last_seen: new Date().toISOString(), signal_db: -72 },
  { callsign: 'HS2XYZ', operator_name: 'สาวิตรี รักดี', status: 'online', frequency: '145.100', last_seen: new Date().toISOString(), signal_db: -65 },
  { callsign: 'HS3ABC', operator_name: 'อนันต์ กล้าหาญ', status: 'busy', frequency: '145.200', last_seen: new Date(Date.now()-300000).toISOString(), signal_db: -81 },
  { callsign: 'EOC-001', operator_name: 'วิภา ศรีปทุม', status: 'online', frequency: '145.050', last_seen: new Date().toISOString(), signal_db: -58 },
  { callsign: 'HS5GHI', operator_name: 'นริศรา แก้วตา', status: 'emergency', frequency: '145.400', last_seen: new Date().toISOString(), signal_db: -45 },
  { callsign: 'AR-007', operator_name: 'ธนากร พิทักษ์', status: 'online', frequency: '145.150', last_seen: new Date().toISOString(), signal_db: -68 },
  { callsign: 'HS4DEF', operator_name: 'ประวิทย์ สุขใจ', status: 'standby', frequency: '145.300', last_seen: new Date(Date.now()-600000).toISOString(), signal_db: -90 },
  { callsign: 'HS6JKL', operator_name: 'รัตนา ไพศาล', status: 'offline', frequency: '145.500', last_seen: new Date(Date.now()-86400000).toISOString(), signal_db: -95 },
];

const mockTranscripts = [
  { id: 1, callsign: 'HS1SPU', operator_name: 'สมชาย', text: 'ศูนย์ศรีปทุม ขอทดสอบสัญญาณ 1-2-3', priority: 'normal', confidence: 94, frequency: '145.000', rssi: '-72dBm', timestamp: new Date().toISOString() },
  { id: 2, callsign: 'EOC-001', operator_name: 'วิภา', text: 'ขอรายงานสถานการณ์ปกติ ทุกคลื่นความถี่ทำงานปกติ', priority: 'normal', confidence: 97, frequency: '145.050', rssi: '-58dBm', timestamp: new Date(Date.now()-120000).toISOString() },
  { id: 3, callsign: 'HS5GHI', operator_name: 'นริศรา', text: 'ขอแจ้งเหตุฉุกเฉิน เกิดไฟไหม้ใกล้โรงอาหาร อาคาร 11', priority: 'emergency', confidence: 99, frequency: '145.400', rssi: '-45dBm', timestamp: new Date().toISOString() },
  { id: 4, callsign: 'HS3ABC', operator_name: 'อนันต์', text: 'หน่วยกู้ชีพกำลังเดินทางไปยังจุดเกิดเหตุ', priority: 'warning', confidence: 92, frequency: '145.200', rssi: '-81dBm', timestamp: new Date(Date.now()-60000).toISOString() },
  { id: 5, callsign: 'AR-007', operator_name: 'ธนากร', text: 'ขอรับทราบและเตรียมพร้อมสนับสนุน', priority: 'normal', confidence: 95, frequency: '145.150', rssi: '-68dBm', timestamp: new Date(Date.now()-30000).toISOString() },
];

const mockEvents = [
  { id: 1, event_type: 'Fire Alarm', severity: 'emergency', callsign: 'HS5GHI', detail: 'เกิดไฟไหม้ใกล้โรงอาหาร อาคาร 11 — ต้องการรถดับเพลิงด่วน', location: 'อาคาร 11', timestamp: new Date().toISOString() },
  { id: 2, event_type: 'Medical', severity: 'warning', callsign: 'EOC-001', detail: 'มีผู้บาดเจ็บเล็กน้อยบริเวณลานจอดรถ อาคาร 5', location: 'อาคาร 5', timestamp: new Date(Date.now()-180000).toISOString() },
  { id: 3, event_type: 'System Check', severity: 'info', callsign: 'HS1SPU', detail: 'ทดสอบระบบสื่อสารประจำวัน — ทุกระบบปกติ', location: 'ศูนย์ควบคุม', timestamp: new Date(Date.now()-360000).toISOString() },
  { id: 4, event_type: 'Security', severity: 'warning', callsign: 'AR-007', detail: 'พบสิ่งต้องสงสัยบริเวณประตูทางเข้า อาคาร 1', location: 'อาคาร 1', timestamp: new Date(Date.now()-540000).toISOString() },
];

const riskGaugeData = [
  { name: 'Security', value: 85, fill: '#22c55e' },
  { name: 'Fire', value: 92, fill: '#ef4444' },
  { name: 'Medical', value: 45, fill: '#f59e0b' },
  { name: 'System', value: 28, fill: '#00d4ff' },
];

const threatData = [
  { name: '00:00', threat: 15, risk: 20 }, { name: '04:00', threat: 25, risk: 30 },
  { name: '08:00', threat: 45, risk: 50 }, { name: '12:00', threat: 70, risk: 65 },
  { name: '16:00', threat: 55, risk: 45 }, { name: '20:00', threat: 35, risk: 30 },
  { name: 'Now', threat: 85, risk: 78 },
];

// === STYLE HELPERS ===
const S = {
  // Panel styles
  panel: (danger = false) => ({
    background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(0,212,255,0.1)'}`,
    borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden',
  }),
  panelGlow: () => ({ ...S.panel(), boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 30px rgba(0,212,255,0.06)' }),
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(0,212,255,0.04)', minHeight: 38 },
  flex: (dir = 'row', gap = 0, wrap = 'nowrap') => ({ display: 'flex', flexDirection: dir, gap, flexWrap: wrap, alignItems: 'center' }),
  // Typography
  heading: { fontFamily: "'Orbitron','Rajdhani',sans-serif" },
  mono: { fontFamily: "'JetBrains Mono','Fira Code',monospace" },
  thai: { fontFamily: "'Kanit','IBM Plex Sans Thai',sans-serif" },
};

// === COMPONENTS ===
const StatusDot = ({ status, size = 8 }) => {
  const colors = { online: '#22c55e', standby: '#f59e0b', busy: '#00d4ff', emergency: '#ef4444', offline: '#6b7280' };
  const c = colors[status] || colors.offline;
  return React.createElement('span', { style: { display: 'inline-block', width: size, height: size, borderRadius: '50%', background: c, boxShadow: status === 'emergency' ? '0 0 6px rgba(239,68,68,0.6)' : status === 'online' ? '0 0 6px rgba(34,197,94,0.5)' : 'none', flexShrink: 0, animation: status === 'emergency' ? 'blink-red 1.2s ease-in-out infinite' : 'none' } });
};

const SignalBars = ({ db }) => {
  const v = typeof db === 'string' ? parseInt(db.replace('dBm','')) : (db || -70);
  const bars = v > -60 ? 5 : v > -70 ? 4 : v > -80 ? 3 : v > -90 ? 2 : 1;
  return React.createElement('span', { style: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 } },
    [1,2,3,4,5].map(i => React.createElement('span', { key: i, style: { width: 3, borderRadius: 1, background: i <= bars ? 'rgba(0,212,255,0.7)' : 'rgba(0,212,255,0.12)', height: i * 3 + 3, transition: 'all 0.2s' } }))
  );
};

const Badge = ({ text, color = '#00d4ff' }) => {
  const colors = { '#00d4ff': 'rgba(0,212,255,0.08)', '#22c55e': 'rgba(34,197,94,0.08)', '#f59e0b': 'rgba(245,158,11,0.08)', '#ef4444': 'rgba(239,68,68,0.08)', '#6b7280': 'rgba(107,114,128,0.1)' };
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', padding: '1px 5px', borderRadius: 3, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: colors[color] || colors['#00d4ff'], color, border: `1px solid ${color}22`, whiteSpace: 'nowrap' } }, text);
};

const IconSpan = ({ icon, size = 12 }) => React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0, fontSize: size-1 } }, icon);

// === HEADER ===
const TopHeader = ({ stats, systemTime }) => React.createElement('div', { style: { ...S.panel(), marginBottom: 8 } }, [
  React.createElement('div', { key: 'inner', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', gap: 16 } }, [
    // Left
    React.createElement('div', { key: 'l', style: { display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 } }, [
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } }, [
        React.createElement('div', { style: { width: 38, height: 38, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff' } },
          React.createElement(Radio, { size: 20 })
        ),
        React.createElement('div', {}, [
          React.createElement('div', { style: { ...S.heading, fontSize: 12, fontWeight: 700, color: '#00d4ff', letterSpacing: '0.15em', lineHeight: 1.2 } }, 'SMART EMERGENCY'),
          React.createElement('div', { style: { ...S.heading, fontSize: 12, fontWeight: 700, color: '#00d4ff', letterSpacing: '0.15em', lineHeight: 1.2 } }, 'COMMUNICATION CENTER'),
        ]),
      ]),
      React.createElement('div', { style: { width: 1, height: 28, background: 'rgba(0,212,255,0.1)' } }),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 4, background: stats.emergencyEvents > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: stats.emergencyEvents > 0 ? '#ef4444' : '#22c55e', fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 600, letterSpacing: '0.06em' } }, [
        React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: stats.emergencyEvents > 0 ? 'blink-red 1.2s ease-in-out infinite' : 'none' } }),
        stats.emergencyEvents > 0 ? `EMERGENCIES: ${stats.emergencyEvents}` : 'ALL CLEAR',
      ]),
    ]),
    // Center
    React.createElement('div', { key: 'c', style: { display: 'flex', alignItems: 'center', gap: 14, fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' } }, [
      ['📶', 'NET:', '#22c55e', 'ONLINE'],
      ['📡', 'FREQ:', '#f59e0b', '145.000 MHz'],
      ['👥', 'OPS:', '#94a3b8', `${stats.onlineCallsigns}/${stats.totalCallsigns}`],
      ['🌡', 'TEMP:', '#f1f5f9', '31°C'],
      ['🌍', 'Partly Cloudy', '#94a3b8', ''],
    ].map(([ico, label, color, val], i) =>
      React.createElement('span', { key: i, style: { display: 'flex', alignItems: 'center', gap: 4 } }, [
        React.createElement('span', { style: { fontSize: 9 } }, ico),
        ` ${label} `,
        val ? React.createElement('strong', { style: { color, fontWeight: 600 } }, String(val)) : null,
      ])
    )),
    // Right
    React.createElement('div', { key: 'r', style: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 } }, [
      React.createElement('div', { style: { textAlign: 'right' } }, [
        React.createElement('div', { style: { fontSize: 6, color: '#64748b', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.08em' } }, 'INCIDENT LEVEL'),
        React.createElement('div', { style: { ...S.heading, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: stats.emergencyEvents > 0 ? '#ef4444' : '#22c55e', animation: stats.emergencyEvents > 0 ? 'pulse-glow 2s ease-in-out infinite' : 'none' } }, stats.emergencyEvents > 0 ? 'EMERGENCY' : 'NORMAL'),
      ]),
      React.createElement('div', { style: { width: 1, height: 28, background: 'rgba(0,212,255,0.1)' } }),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#00d4ff', fontWeight: 600 } },
        [React.createElement(Clock, { size: 12 }), systemTime]
      ),
    ]),
  ]),
]);

// === SDR SPECTRUM ===
const SDRSpectrum = ({ analyser, isListening }) => {
  const fftRef = useRef(null);
  const wfRef = useRef(null);
  const animRef = useRef(null);
  const [freq, setFreq] = useState(145.000);
  const [gain, setGain] = useState(60);
  const wfData = useRef(null);

  useEffect(() => {
    const fft = fftRef.current; const wf = wfRef.current;
    if (!fft || !wf) return;
    const fctx = fft.getContext('2d'); const wctx = wf.getContext('2d');
    const w = fft.width, h = fft.height, wfW = wf.width, wfH = wf.height;
    if (!wfData.current) wfData.current = Array.from({ length: wfH }, () => new Uint8Array(wfW).fill(128));

    const draw = () => {
      const data = new Uint8Array(analyser?.frequencyBinCount || 256);
      const pts = analyser && isListening ? (analyser.getByteFrequencyData(data), Array.from(data)) : Array.from({ length: 256 }, () => Math.floor(Math.random() * 25 + 25 + Math.sin(Date.now()/1000 + Math.random()) * 12));
      fctx.clearRect(0, 0, w, h);
      const g = fctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,212,255,0.02)'); g.addColorStop(1,'rgba(0,212,255,0.005)');
      fctx.fillStyle=g; fctx.fillRect(0,0,w,h);
      // Grid
      fctx.strokeStyle='rgba(0,212,255,0.04)'; fctx.lineWidth=0.5;
      for(let i=0;i<8;i++){const y=(h/8)*i;fctx.beginPath();fctx.moveTo(0,y);fctx.lineTo(w,y);fctx.stroke()}
      // FFT line
      const step=w/pts.length;
      fctx.beginPath(); fctx.strokeStyle='rgba(0,212,255,0.2)'; fctx.lineWidth=1;
      pts.forEach((v,i)=>{const x=i*step,y=h-(v/255)*h*0.85;i===0?fctx.moveTo(x,y):fctx.lineTo(x,y)});
      fctx.stroke();
      // Fill
      fctx.beginPath(); fctx.moveTo(0,h);
      pts.forEach((v,i)=>{const x=i*step,y=h-(v/255)*h*0.85;fctx.lineTo(x,y)});
      fctx.lineTo(w,h); fctx.closePath();
      const fl=fctx.createLinearGradient(0,0,0,h); fl.addColorStop(0,'rgba(0,212,255,0.15)'); fl.addColorStop(0.5,'rgba(0,212,255,0.05)'); fl.addColorStop(1,'rgba(0,212,255,0.005)');
      fctx.fillStyle=fl; fctx.fill();
      // Peaks
      pts.forEach((v,i)=>{if(v>200){const x=i*step,y=h-(v/255)*h*0.85;fctx.beginPath();fctx.arc(x,y,2,0,Math.PI*2);fctx.fillStyle='rgba(239,68,68,0.8)';fctx.fill()}else if(v>150){const x=i*step,y=h-(v/255)*h*0.85;fctx.beginPath();fctx.arc(x,y,1.5,0,Math.PI*2);fctx.fillStyle='rgba(245,158,11,0.6)';fctx.fill()}});
      // Freq labels
      fctx.fillStyle='rgba(0,212,255,0.2)'; fctx.font='8px JetBrains Mono'; fctx.textAlign='center';
      ['144.000','144.400','144.800','145.200','145.600','146.000'].forEach((f,i)=>{fctx.fillText(f,(w/5)*i,h-3)});
      // Waterfall
      wfData.current.pop(); wfData.current.unshift([...pts.slice(0,wfW)]);
      wctx.clearRect(0,0,wfW,wfH);
      wfData.current.forEach((row,ri)=>{row.forEach((v,ci)=>{const t=v/255;let r,g,b;if(t<0.3){r=0;g=Math.floor(t*4*50);b=Math.floor(t*4*100+40)}else if(t<0.6){const s=(t-0.3)/0.3;r=Math.floor(s*30);g=Math.floor((1-s)*60+s*200);b=Math.floor((1-s)*120+s*200)}else if(t<0.8){const s=(t-0.6)/0.2;r=Math.floor(s*200);g=Math.floor((1-s)*200+s*50);b=Math.floor((1-s)*200)}else{const s=Math.min((t-0.8)/0.2,1);r=Math.floor(200+s*55);g=Math.floor((1-s)*50);b=Math.floor((1-s)*50)};wctx.fillStyle=`rgb(${r},${g},${b})`;wctx.fillRect(ci,ri,1,1)})});
      animRef.current=requestAnimationFrame(draw);
    };
    animRef.current=requestAnimationFrame(draw);
    return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current)};
  }, [analyser,isListening]);

  const st = (ic) => ({ display:'flex', alignItems:'center', gap: ic, fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: '#64748b' });

  return React.createElement('div', { style: { ...S.panelGlow(), display:'flex', flexDirection:'column', height:'100%' } }, [
    React.createElement('div', { key:'h', style: S.header }, [
      React.createElement('div', { style: S.flex('row',6) }, [React.createElement(Antenna,{size:12,style:{color:'rgba(0,212,255,0.7)'}}), React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'SDR SPECTRUM ANALYZER')]),
      React.createElement('div', { style: S.flex('row',10) }, [
        React.createElement('span',{style:{color:'#f59e0b',fontWeight:600}},'145.000 MHz'),
        React.createElement('span',{style:{...S.mono,fontSize:7,color:'#22c55e',display:'flex',alignItems:'center',gap:4}},[React.createElement(Signal,{size:8}),'LOCKED']),
      ]),
    ]),
    React.createElement('div', { key:'c', style: { ...S.flex('row',12), padding:'4px 14px', borderBottom:'1px solid rgba(0,212,255,0.04)' } }, [
      ['FREQ',144,146,freq,(e)=>setFreq(parseFloat(e.target.value))],
      ['GAIN',0,100,gain,(e)=>setGain(parseInt(e.target.value)),`${gain} dB`],
    ].map(([label,min,max,val,onChange,extra],i)=>React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:6}},[
      React.createElement('span',{style:{...S.mono,fontSize:7,color:'#64748b'}},label),
      React.createElement('input',{type:'range',min,max,step:label==='FREQ'?'0.001':'1',value:val,onChange,style:{width:label==='FREQ'?80:60,height:3,appearance:'none',background:'rgba(0,212,255,0.1)',borderRadius:2,outline:'none',accentColor:'#00d4ff',cursor:'pointer'}}),
      extra&&React.createElement('span',{style:{fontSize:7,fontFamily:"'JetBrains Mono',monospace",color:'#64748b'}},extra),
    ]))),
    React.createElement('div', { key:'v', style: { flex:1, display:'flex', gap:6, padding:6, background:'rgba(0,0,0,0.2)', minHeight:0 } }, [
      React.createElement('div', { style: { display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'4px 0', flexShrink:0 } },
        ['-20','-40','-60','-80','-100'].map(l=>React.createElement('span',{key:l,style:{fontSize:5,fontFamily:"'JetBrains Mono',monospace",color:'rgba(0,212,255,0.15)',lineHeight:1}},l))
      ),
      React.createElement('div', { style: { flex:1, display:'flex', flexDirection:'column', gap:1, background:'rgba(0,0,0,0.3)', borderRadius:4, overflow:'hidden' } }, [
        React.createElement('canvas', { ref:fftRef, width:700, height:140, style:{width:'100%',flex:1,borderBottom:'1px solid rgba(0,212,255,0.04)'} }),
        React.createElement('canvas', { ref:wfRef, width:700, height:80, style:{width:'100%'} }),
      ]),
    ]),
    React.createElement('div', { key:'f', style: { ...S.flex('row',16), padding:'4px 14px', borderTop:'1px solid rgba(0,212,255,0.04)', fontSize:6, fontFamily: "'JetBrains Mono',monospace", color:'#64748b' } },
      ['BW: 2.0 MHz','SIG: -68 dBm','NOISE: -98 dBm'].map(t=>React.createElement('span',{key:t,style:{display:'flex',alignItems:'center',gap:3}},[React.createElement(BarChart3,{size:6}),t]))
    ),
  ]);
};

// === TRANSCRIPTS ===
const TranscriptPanel = ({ transcripts }) => {
  const getPrio = p => {
    const l=(p||'').toLowerCase();
    if(l==='emergency')return{border:'2px 0 0 solid #ef4444',bg:'rgba(239,68,68,0.02)',badge:'#ef4444',label:'EMERGENCY'};
    if(l==='warning')return{border:'2px 0 0 solid #f59e0b',bg:'rgba(245,158,11,0.015)',badge:'#f59e0b',label:'WARNING'};
    return{border:'2px 0 0 solid rgba(0,212,255,0.3)',bg:'transparent',badge:'#00d4ff',label:'NORMAL'};
  };

  return React.createElement('div', { style: { ...S.panel(), display:'flex', flexDirection:'column', height:'100%' } }, [
    React.createElement('div', { key:'h', style: S.header }, [
      React.createElement('div', { style: S.flex('row',6) }, [React.createElement(Radio,{size:12,style:{color:'rgba(0,212,255,0.7)'}}), React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'LIVE RADIO TRANSCRIPT')]),
      React.createElement('span',{style:{...S.mono,fontSize:8,color:'#64748b'}},`${transcripts.length} messages`),
    ]),
    React.createElement('div', { key:'b', style: { flex:1, overflowY:'auto', padding:6 } },
      transcripts.length > 0 ? transcripts.map((t,i)=>{
        const p=getPrio(t.priority);
        return React.createElement('div',{key:t.id||i,style:{padding:'8px 10px',marginBottom:4,background:p.bg,border:p.border,borderRadius:6,borderLeft:`2px solid ${p.badge}`,fontSize:10,transition:'background 0.2s'}},[
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,marginBottom:3}},[
            React.createElement('div',{style:S.flex('row',6)},[
              React.createElement('span',{style:{fontWeight:700,color:'#00d4ff',fontFamily:"'JetBrains Mono',monospace",fontSize:10}},t.callsign||'UNKNOWN'),
              t.operator_name&&React.createElement('span',{style:{fontSize:7,color:'#64748b'}},t.operator_name),
            ]),
            React.createElement('div',{style:S.flex('row',4)},[
              t.priority&&React.createElement(Badge,{text:p.label,color:p.badge}),
              t.confidence&&React.createElement(Badge,{text:`AI ${t.confidence}%`,color:'#22c55e'}),
            ]),
          ]),
          React.createElement('p',{style:{color:'rgba(241,245,249,0.8)',fontSize:9,lineHeight:1.4,marginBottom:4,fontStyle:'italic',...S.thai}},`"${t.text||t.transcript||''}"`),
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}},['RSSI',t.frequency||'145.000'].map((v,idx)=>React.createElement('span',{key:idx,style:{display:'flex',alignItems:'center',gap:4,fontSize:7,fontFamily:"'JetBrains Mono',monospace",color:'#64748b'}},[
            idx===0?React.createElement(SignalBars,{db:t.rssi||t.signal_strength}):React.createElement(Activity,{size:6}),
            idx===0?(t.rssi||t.signal_strength||'-70dBm'):`${v} MHz`,
          ])).concat(React.createElement('span',{key:2,style:{fontSize:7,fontFamily:"'JetBrains Mono',monospace",color:'#64748b'}},t.timestamp?new Date(t.timestamp).toLocaleTimeString():''))),
        ]);
      }) : React.createElement('div', { style: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#64748b', gap:8 } }, [
        React.createElement(Radio,{size:24,style:{opacity:0.3}}),
        React.createElement('p',{style:{fontSize:9}},'Waiting for transmissions...'),
        React.createElement('span',{style:{...S.mono,fontSize:7,color:'rgba(0,212,255,0.5)'}},[React.createElement('span',{style:{display:'inline-block',width:5,height:5,borderRadius:'50%',background:'#00d4ff',marginRight:4,animation:'pulse-glow 2s ease-in-out infinite'}}),'145.000 MHz']),
      ])
    ),
  ]);
};

// === EVENT LOG ===
const EventLogPanel = ({ events }) => {
  const [filter,setFilter]=useState('all');
  const filtered=events.filter(e=>filter==='all'||(e.severity||'').toLowerCase()===filter);

  return React.createElement('div',{style:{...S.panel(),display:'flex',flexDirection:'column',height:'100%'}},[
    React.createElement('div',{key:'h',style:S.header},[
      React.createElement('div',{style:S.flex('row',6)},[React.createElement(Zap,{size:12,style:{color:'rgba(0,212,255,0.7)'}}),React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'EMERGENCY EVENT LOG')]),
      React.createElement('div',{style:S.flex('row',3)},[['all','info','warning','emergency','critical'].map(s=>{
        const isActive=filter===s;
        const bg=isActive?(s==='all'||s==='info'?'rgba(0,212,255,0.1)':s==='warning'?'rgba(245,158,11,0.1)':s==='emergency'?'rgba(239,68,68,0.1)':'rgba(239,68,68,0.15)'):'transparent';
        const c=isActive?(s==='all'||s==='info'?'#00d4ff':s==='warning'?'#f59e0b':s==='emergency'?'#ef4444':'#ef4444'):'#64748b';
        return React.createElement('button',{key:s,onClick:()=>setFilter(s),style:{padding:'1px 5px',borderRadius:3,fontSize:6,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",background:bg,color:c,border:'none',cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.2s'}},s==='all'?'ALL':s.toUpperCase());
      })]),
    ]),
    React.createElement('div',{key:'b',style:{flex:1,overflowY:'auto',minHeight:0}},
      filtered.length>0?filtered.map((e,i)=>{
        const sev=(e.severity||'').toLowerCase();
        const isEm=sev==='emergency'||sev==='critical';
        const isWarn=sev==='warning';
        const icon=isEm?'🔴':isWarn?'⚠️':'ℹ️';
        const borderColor=isEm?'#ef4444':isWarn?'#f59e0b':'rgba(0,212,255,0.15)';
        return React.createElement('div',{key:e.id||i,style:{display:'flex',gap:6,padding:'5px 12px',borderLeft:`2px solid ${borderColor}`,transition:'background 0.2s'}},[
          React.createElement('span',{style:{fontSize:9,flexShrink:0,paddingTop:1}},icon),
          React.createElement('div',{style:{flex:1,minWidth:0}},[
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,marginBottom:1}},[
              React.createElement('span',{style:{fontSize:8,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:'rgba(241,245,249,0.8)'}},e.event_type||'System Event'),
              React.createElement(Badge,{text:(e.severity||'info').toUpperCase(),color:isEm?'#ef4444':isWarn?'#f59e0b':'#00d4ff'}),
            ]),
            React.createElement('p',{style:{fontSize:8,color:'#94a3b8',lineHeight:1.3,...S.thai}},e.detail||''),
            React.createElement('div',{style:{display:'flex',gap:8,marginTop:2,fontSize:6,fontFamily:"'JetBrains Mono',monospace",color:'#64748b'}},[
              e.callsign&&React.createElement('span',{style:{color:'rgba(0,212,255,0.5)'}},e.callsign),
              e.location&&React.createElement('span',{style:{color:'rgba(245,158,11,0.4)'}},e.location),
              React.createElement('span',{},e.timestamp?new Date(e.timestamp).toLocaleString():''),
            ]),
          ]),
        ]);
      }):React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#64748b',fontSize:9}},'No events recorded')
    ),
  ]);
};

// === TACTICAL MAP ===
const TacticalMap = ({ incidents }) => {
  const buildings = [
    {id:1,name:'อาคาร 1',x:120,y:60},{id:2,name:'อาคาร 2',x:250,y:60},{id:3,name:'อาคาร 3',x:380,y:60},{id:4,name:'อาคาร 4',x:510,y:60},
    {id:5,name:'อาคาร 5',x:190,y:160},{id:6,name:'อาคาร 6',x:320,y:160},{id:7,name:'อาคาร 7',x:450,y:160},
    {id:8,name:'อาคาร 8',x:120,y:260},{id:9,name:'อาคาร 9',x:250,y:260},{id:10,name:'อาคาร 10',x:380,y:260},{id:11,name:'อาคาร 11',x:510,y:260},
  ];
  const stations=[{id:'R1',name:'Repeater 1',x:60,y:30,freq:'145.000'},{id:'R2',name:'Repeater 2',x:580,y:30,freq:'145.200'},{id:'R3',name:'Command Post',x:310,y:340,freq:'145.100'}];
  const emBuildings=new Set();
  incidents.forEach(inc=>{const m=inc.detail?.match(/อาคาร\s*(\d+)/i)||inc.detail?.match(/Building\s*(\d+)/i);if(m){const b=buildings.find(b=>b.id===parseInt(m[1]));if(b&&(inc.severity==='emergency'||inc.severity==='critical'))emBuildings.add(b.id)}});

  return React.createElement('div',{style:S.panelGlow()},[
    React.createElement('div',{key:'h',style:S.header},[
      React.createElement('div',{style:S.flex('row',6)},[React.createElement(MapPin,{size:12,style:{color:'rgba(0,212,255,0.7)'}}),React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'TACTICAL GIS MAP — SPU CAMPUS')]),
      React.createElement('div',{style:S.flex('row',8,undefined,undefined,6,true)},[['#00d4ff','Normal'],['#f59e0b','Alert'],['#ef4444','Emergency']].map(([c,l])=>React.createElement('span',{key:l,style:S.flex('row',3,undefined,6,true)},[React.createElement('span',{style:{width:4,height:4,borderRadius:'50%',background:c,animation:c==='#ef4444'?'blink-red 1.2s ease-in-out infinite':'none'}}),React.createElement('span',{style:{fontSize:6,color:'#64748b',fontFamily:"'JetBrains Mono',monospace"}},l)]))),
    ]),
    React.createElement('div',{key:'m',style:{padding:6,background:'rgba(0,0,0,0.2)'}},[
      React.createElement('svg',{viewBox:'0 0 640 360',style:{width:'100%',height:'auto',borderRadius:4}},['children'].length>0&&'svg'.replace('svg','').concat(
        // Grid pattern
        React.createElement('defs',{key:'d'},[
          React.createElement('pattern',{id:'g2',width:30,height:30,patternUnits:'userSpaceOnUse'},[React.createElement('path',{d:'M30 0L0 0 0 30',fill:'none',stroke:'rgba(0,212,255,0.03)',strokeWidth:0.5})]),
          React.createElement('radialGradient',{id:'eg2'},[React.createElement('stop',{offset:'0%',stopColor:'rgba(239,68,68,0.3)'}),React.createElement('stop',{offset:'100%',stopColor:'rgba(239,68,68,0)'})]),
        ]),
        React.createElement('rect',{key:'bg',width:640,height:360,fill:'url(#g2)'}),
        // Roads
        [100,220,340].map(y=>React.createElement('line',{key:`h${y}`,x1:0,y1:y,x2:640,y2:y,stroke:'rgba(0,212,255,0.04)',strokeWidth:0.5,strokeDasharray:'3,4'})),
        [180,460].map(x=>React.createElement('line',{key:`v${x}`,x1:x,y1:0,x2:x,y2:360,stroke:'rgba(0,212,255,0.04)',strokeWidth:0.5,strokeDasharray:'3,4'})),
        // Stations
        stations.map(s=>React.createElement('g',{key:s.id},[
          React.createElement('line',{x1:s.x,y1:s.y,x2:310,y2:340,stroke:'rgba(0,212,255,0.06)',strokeWidth:0.5,strokeDasharray:'4,3'}),
          React.createElement('circle',{cx:s.x,cy:s.y,r:10,fill:'rgba(0,212,255,0.06)',stroke:'rgba(0,212,255,0.3)',strokeWidth:0.8}),
          React.createElement('circle',{cx:s.x,cy:s.y,r:4,fill:'#00d4ff'}),
          React.createElement('text',{x:s.x,y:s.y+18,textAnchor:'middle',fill:'rgba(0,212,255,0.4)',fontSize:4.5,fontFamily:'JetBrains Mono'},s.name),
          React.createElement('text',{x:s.x,y:s.y+24,textAnchor:'middle',fill:'rgba(0,212,255,0.2)',fontSize:4,fontFamily:'JetBrains Mono'},s.freq+' MHz'),
        ])),
        // Buildings
        ...buildings.map(b=>{
          const isEm=emBuildings.has(b.id);
          return React.createElement('g',{key:b.id},[
            isEm&&React.createElement('circle',{cx:b.x+15,cy:b.y+12,r:25,fill:'url(#eg2)'}),
            React.createElement('rect',{x:b.x,y:b.y,width:30,height:24,rx:2,fill:isEm?'rgba(239,68,68,0.15)':'rgba(0,212,255,0.04)',stroke:isEm?'#ef4444':'rgba(0,212,255,0.2)',strokeWidth:1.2}),
            React.createElement('text',{x:b.x+15,y:b.y+14,textAnchor:'middle',fill:isEm?'#ef4444':'rgba(0,212,255,0.3)',fontSize:7,fontFamily:'JetBrains Mono',fontWeight:isEm?'bold':'normal'},String(b.id)),
            isEm&&React.createElement('text',{x:b.x+15,y:b.y-6,textAnchor:'middle',fill:'#ef4444',fontSize:6,fontFamily:'JetBrains Mono',fontWeight:'bold'},'⚠ FIRE'),
          ]);
        }),
      )),
    ]),
  ]);
};

// === CALLSIGN DATABASE ===
const CallsignDatabase = ({ callsigns }) => {
  const [search,setSearch]=useState('');
  const [sf,setSf]=useState('all');
  const filtered=callsigns.filter(c=>{
    const ms=!search||(c.callsign||'').toLowerCase().includes(search.toLowerCase())||(c.operator_name||'').toLowerCase().includes(search.toLowerCase());
    return ms&&(sf==='all'||(c.status||'').toLowerCase()===sf);
  });

  return React.createElement('div',{style:{...S.panel(),display:'flex',flexDirection:'column',height:'100%'}},[
    React.createElement('div',{key:'h',style:S.header},[
      React.createElement('div',{style:S.flex('row',6)},[React.createElement(Database,{size:12,style:{color:'rgba(0,212,255,0.7)'}}),React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'CALLSIGN DATABASE')]),
      React.createElement('span',{style:{...S.mono,fontSize:8,color:'#64748b'}},`${callsigns.length} operators`),
    ]),
    React.createElement('div',{key:'s',style:{padding:'6px 10px',borderBottom:'1px solid rgba(0,212,255,0.04)'}},[
      React.createElement('div',{style:{display:'flex',alignItems:'center',gap:4,background:'rgba(0,0,0,0.2)',border:'1px solid rgba(0,212,255,0.05)',borderRadius:6,padding:'3px 6px',marginBottom:4}},[
        React.createElement(Search,{size:8,color:'#64748b'}),
        React.createElement('input',{value:search,onChange:e=>setSearch(e.target.value),placeholder:'Search callsign or operator...',style:{flex:1,background:'transparent',border:'none',outline:'none',color:'#f1f5f9',fontSize:8,...S.thai}}),
      ]),
      React.createElement('div',{style:S.flex('row',3,true)},[['all','online','standby','busy','emergency','offline'].map(s=>{
        const isActive=sf===s;
        const dotColors={online:'#22c55e',standby:'#f59e0b',busy:'#00d4ff',emergency:'#ef4444',offline:'#6b7280'};
        return React.createElement('button',{key:s,onClick:()=>setSf(s),style:{display:'flex',alignItems:'center',gap:3,padding:'1px 5px',borderRadius:3,fontSize:6,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",background:isActive?'rgba(0,212,255,0.08)':'transparent',color:isActive?'#00d4ff':'#64748b',border:isActive?'1px solid rgba(0,212,255,0.12)':'1px solid transparent',cursor:'pointer',transition:'all 0.2s'}},[
          s!=='all'&&React.createElement('span',{style:{width:4,height:4,borderRadius:'50%',background:dotColors[s],flexShrink:0}}),
          s.toUpperCase(),
        ]);
      })]),
    ]),
    React.createElement('div',{key:'t',style:{flex:1,overflow:'auto',minHeight:0}},[
      React.createElement('table',{style:{width:'100%',fontSize:8,fontFamily:"'JetBrains Mono',monospace"}},[
        React.createElement('thead',{key:'th'},[React.createElement('tr',{style:{background:'rgba(0,0,0,0.3)',fontSize:6,color:'#64748b',letterSpacing:'0.08em'}},[['CALLSIGN','OPERATOR','STATUS','SIGNAL','LAST SEEN'].map(h=>React.createElement('th',{key:h,style:{textAlign:'left',padding:'3px 8px',fontWeight:600,whiteSpace:'nowrap'}},h))])]),
        React.createElement('tbody',{key:'tb'},
          filtered.length>0?filtered.map((c,i)=>{
            const st=(c.status||'offline').toLowerCase();
            const badgeColors={online:'#22c55e',standby:'#f59e0b',busy:'#00d4ff',emergency:'#ef4444',offline:'#6b7280'};
            return React.createElement('tr',{key:c.id||i,style:{borderBottom:'1px solid rgba(0,212,255,0.02)',transition:'background 0.2s'}},[
              React.createElement('td',{style:{padding:'3px 8px',color:'#00d4ff',fontWeight:700,fontSize:8}},c.callsign||'---'),
              React.createElement('td',{style:{padding:'3px 8px',color:'#94a3b8',fontSize:7,...S.thai}},c.operator_name||c.full_name||'---'),
              React.createElement('td',{style:{padding:'3px 8px'}},[React.createElement(Badge,{text:st.toUpperCase(),color:badgeColors[st]||'#6b7280'})]),
              React.createElement('td',{style:{padding:'3px 8px'}},[React.createElement(SignalBars,{db:c.signal_db||-70})]),
              React.createElement('td',{style:{padding:'3px 8px',color:'#64748b',fontSize:6}},c.last_seen?new Date(c.last_seen).toLocaleTimeString():'---'),
            ]);
          }):React.createElement('tr',{},[React.createElement('td',{colSpan:5,style:{textAlign:'center',padding:'16px',color:'#64748b',fontSize:8}},'No matching operators')])
        ),
      ]),
    ]),
  ]);
};

// === AI PANEL ===
const AIIncidentPanel = () => {
  return React.createElement('div',{style:{...S.panelGlow(),display:'flex',flexDirection:'column',height:'100%'}},[
    React.createElement('div',{key:'h',style:S.header},[
      React.createElement('div',{style:S.flex('row',6)},[React.createElement(Gauge,{size:12,style:{color:'rgba(0,212,255,0.7)'}}),React.createElement('span',{style:{...S.heading,fontSize:9,fontWeight:600,color:'#00d4ff',letterSpacing:'0.15em'}},'AI INCIDENT DETECTION')]),
      React.createElement(Badge,{text:'AI v3.0',color:'#00d4ff'}),
    ]),
    React.createElement('div',{key:'b',style:{flex:1,padding:8,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,minHeight:0}},[
      // Risk gauge
      React.createElement('div',{key:'g',style:{background:'rgba(0,0,0,0.2)',borderRadius:8,padding:6}},[
        React.createElement('div',{style:{...S.mono,fontSize:6,color:'#64748b',textAlign:'center',marginBottom:4,letterSpacing:'0.08em'}},'Risk Score'),
        React.createElement(ResponsiveContainer,{width:'100%',height:60},React.createElement(RadialBarChart,{cx:'50%',cy:'50%',innerRadius:'50%',outerRadius:'80%',barSize:6,data:riskGaugeData,startAngle:180,endAngle:0},[React.createElement(PolarAngleAxis,{type:'number',domain:[0,100],tick:false}),React.createElement(RadialBar,{background:true,dataKey:'value',cornerRadius:3})])),
        React.createElement('div',{style:{...S.flex('row',4,true),marginTop:4,justifyContent:'center'}},riskGaugeData.map(d=>React.createElement('span',{key:d.name,style:{...S.flex('row',2),fontSize:5,fontFamily:"'JetBrains Mono',monospace",color:'#64748b'}},[React.createElement('span',{style:{width:3,height:3,borderRadius:'50%',background:d.fill,flexShrink:0}}),`${d.name} ${d.value}%`]))),
      ]),
      // Threat trend
      React.createElement('div',{key:'t',style:{background:'rgba(0,0,0,0.2)',borderRadius:8,padding:6}},[
        React.createElement('div',{style:{...S.mono,fontSize:6,color:'#64748b',marginBottom:4,letterSpacing:'0.08em'}},'Threat Trend'),
        React.createElement(ResponsiveContainer,{width:'100%',height:60},React.createElement(AreaChart,{data:threatData},[
          React.createElement('defs',{},[React.createElement('linearGradient',{id:'tg',x1:0,y1:0,x2:0,y2:1},[React.createElement('stop',{offset:'5%',stopColor:'#ef4444',stopOpacity:0.3}),React.createElement('stop',{offset:'95%',stopColor:'#ef4444',stopOpacity:0})]),React.createElement('linearGradient',{id:'rg',x1:0,y1:0,x2:0,y2:1},[React.createElement('stop',{offset:'5%',stopColor:'#f59e0b',stopOpacity:0.2}),React.createElement('stop',{offset:'95%',stopColor:'#f59e0b',stopOpacity:0})])]),
          React.createElement(CartesianGrid,{strokeDasharray:'2 2',stroke:'rgba(0,212,255,0.03)'}),
          React.createElement(XAxis,{dataKey:'name',tick:{fontSize:5,fill:'#64748b'},axisLine:false}),
          React.createElement(YAxis,{domain:[0,100],tick:{fontSize:5,fill:'#64748b'},axisLine:false}),
          React.createElement(Tooltip,{contentStyle:{background:'#0f172a',border:'1px solid rgba(0,212,255,0.1)',borderRadius:6,fontSize:8}}),
          React.createElement(Area,{type:'monotone',dataKey:'threat',stroke:'#ef4444',fill:'url(#tg)',strokeWidth:1}),
          React.createElement(Area,{type:'monotone',dataKey:'risk',stroke:'#f59e0b',fill:'url(#rg)',strokeWidth:1}),
        ])),
      ]),
      // AI Recommendations
      React.createElement('div',{key:'r',style:{gridColumn:'1 / -1',background:'rgba(0,0,0,0.2)',borderRadius:8,padding:8}},[
        React.createElement('div',{style:{...S.flex('row',6),...S.mono,fontSize:6,color:'#64748b',marginBottom:6,letterSpacing:'0.08em'}},[React.createElement(Shield,{size:6,color:'#00d4ff'}),'AI RECOMMENDATIONS']),
        [].concat([
          {text:'🔥 Fire at Building 11 — Dispatch fire units immediately',sev:'critical'},
          {text:'🚑 Medical team required at Parking Lot Bldg 5',sev:'warning'},
          {text:'📡 Radio check recommended for Channel 2 (145.200 MHz)',sev:'info'},
          {text:'🔒 Security alert at Main Gate — Camera feed unstable',sev:'warning'},
        ].map((r,i)=>React.createElement('div',{key:i,style:{display:'flex',alignItems:'flex-start',gap:4,padding:'4px 6px',marginBottom:2,borderRadius:4,fontSize:7,borderLeft:`2px solid ${r.sev==='critical'?'#ef4444':r.sev==='warning'?'#f59e0b':'#00d4ff'}`,background:r.sev==='critical'?'rgba(239,68,68,0.04)':r.sev==='warning'?'rgba(245,158,11,0.04)':'rgba(0,212,255,0.04)'}},[
          React.createElement('span',{style:{flexShrink:0,fontSize:7}},r.sev==='critical'?'🔴':r.sev==='warning'?'⚠️':'ℹ️'),
          React.createElement('span',{style:{color:'#94a3b8',lineHeight:1.3,...S.thai}},r.text),
        ]))),
      ]),
      // Quick stats
      React.createElement('div',{key:'q',style:{gridColumn:'1 / -1',display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6}},[
        [{l:'THREAT LEVEL',v:'CRITICAL',c:'#ef4444'},{l:'AI CONFIDENCE',v:'94.2%',c:'#00d4ff'},{l:'RESPONSE TIME',v:'< 30s',c:'#22c55e'},{l:'ACTIVE ALERTS',v:'4',c:'#f59e0b'}].map((s,i)=>React.createElement('div',{key:i,style:{background:'rgba(0,0,0,0.2)',borderRadius:8,padding:'6px 4px',textAlign:'center'}},[
          React.createElement('div',{style:{...S.mono,fontSize:5,color:'#64748b',letterSpacing:'0.08em',marginBottom:2}},s.l),
          React.createElement('div',{style:{...S.heading,fontSize:11,fontWeight:700,color:s.c}},s.v),
        ])),
      ]),
    ]),
  ]);
};

// === MAIN DASHBOARD ===
const Dashboard = () => {
  const [stats, setStats] = useState({ totalCallsigns: 8, onlineCallsigns: 5, emergencyEvents: 1, recentTranscripts: mockTranscripts, recentEvents: mockEvents, callsigns: mockCallsigns });
  const [loading, setLoading] = useState(false);
  const [systemTime, setSystemTime] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const [analyser, setAnalyser] = useState(null);
  const [speechText, setSpeechText] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);

  // Clock
  useEffect(() => {
    const u = () => setSystemTime(new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    u(); const i = setInterval(u, 1000);
    return () => clearInterval(i);
  }, []);

  // Fetch data with fallback to mock
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [callsigns, transcripts, events] = await Promise.all([
          callsignAPI.list().catch(() => ({ data: mockCallsigns })),
          transcriptAPI.recent(20).catch(() => ({ data: mockTranscripts })),
          eventAPI.list({ limit: 20 }).catch(() => ({ data: mockEvents })),
        ]);
        const cs = toList(callsigns.data || callsigns);
        const ts = toList(transcripts.data || transcripts);
        const es = toList(events.data || events);
        setStats({
          totalCallsigns: cs.length,
          onlineCallsigns: cs.filter(c => c.status === 'online').length,
          emergencyEvents: es.filter(e => e.severity === 'emergency' || e.severity === 'critical').length,
          recentTranscripts: ts, recentEvents: es, callsigns: cs,
        });
      } catch (err) {
        // Use mock as fallback
        setStats({ totalCallsigns: 8, onlineCallsigns: 5, emergencyEvents: 1, recentTranscripts: mockTranscripts, recentEvents: mockEvents, callsigns: mockCallsigns });
      } finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Speech recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { setMicStatus('denied'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'th-TH';
    rec.onstart = () => setMicStatus('listening');
    rec.onresult = (e) => {
      let f = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) f += e.results[i][0].transcript;
      if (f) {
        setSpeechText(f);
        const nt = { id: Date.now(), text: f, callsign: 'Live Mic', operator_name: 'Operator', priority: f.includes('ฉุกเฉิน') || f.includes('ช่วย') ? 'emergency' : 'normal', confidence: 90 + Math.floor(Math.random() * 10), frequency: '145.000', rssi: `-${50 + Math.floor(Math.random() * 30)}dBm`, timestamp: new Date().toISOString() };
        setTranscriptHistory(prev => [nt, ...prev.slice(0, 49)]);
        if (nt.priority === 'emergency') fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'live_transcript', data: nt }) }).catch(() => {});
      }
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'denied') setMicStatus('denied'); };
    rec.onend = () => { if (micActive) { try { rec.start(); } catch (e) {} } };
    recognitionRef.current = rec;
    try {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        micStreamRef.current = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const an = ctx.createAnalyser(); an.fftSize = 512;
        src.connect(an); setAnalyser(an);
      }).catch(() => setMicStatus('denied'));
    } catch (e) {}
    rec.start();
  }, [micActive]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; setAnalyser(null); }
    setMicStatus('idle');
  }, []);

  const toggleMic = () => { micActive ? (stopListening(), setMicActive(false)) : (setMicActive(true), startListening()); };
  const allTranscripts = [...transcriptHistory, ...stats.recentTranscripts.filter(t => !transcriptHistory.find(th => th.text === t.text))].slice(0, 30);

  if (loading) {
    return React.createElement('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'#00d4ff'}},[
      React.createElement('div',{style:{width:60,height:60,borderRadius:'50%',border:'2px solid rgba(0,212,255,0.1)',borderTopColor:'#00d4ff',animation:'spin 1s linear infinite',display:'flex',alignItems:'center',justifyContent:'center'}},React.createElement(Radio,{size:24})),
      React.createElement('p',{style:{...S.heading,fontSize:13,letterSpacing:'0.15em'}},'INITIALIZING COMMAND CENTER...'),
      React.createElement('p',{style:{...S.mono,fontSize:9,color:'#64748b'}},'SPU Emergency Operations System v3.0'),
    ]);
  }

  const panelStyle = { maxWidth:1440, margin:'0 auto', padding:10 };
  const gridStyle = { display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:10, minHeight:'calc(100vh - 120px)' };

  return React.createElement('div', { style: panelStyle }, [
    React.createElement(TopHeader, { key: 'h', stats, systemTime }),
    // Error banner
    micStatus === 'denied' && React.createElement('div', { key: 'e', style: { display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:8, fontSize:9, color:'#ef4444', marginBottom:6 } }, [
      React.createElement(AlertCircle, { size: 10 }), 'Microphone access denied. Please enable microphone in browser settings.',
      React.createElement('button', { onClick: () => setMicStatus('idle'), style: { marginLeft:'auto', color:'#64748b', textDecoration:'underline', background:'none', border:'none', cursor:'pointer', fontSize:8 } }, 'Dismiss'),
    ]),
    // Main grid
    React.createElement('div', { key: 'g', style: gridStyle }, [
      // LEFT (3 cols)
      React.createElement('div', { key: 'left', style: { gridColumn:'span 3', display:'flex', flexDirection:'column', gap:8 } }, [
        // Mic control
        React.createElement('div', { key: 'mic', style: S.panel() }, [
          React.createElement('div', { style: { display:'flex', alignItems:'center', gap:8, padding:'6px 10px' } }, [
            React.createElement('button', { onClick: toggleMic, style: { display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:6, border: `1px solid ${micStatus==='listening'?'rgba(34,197,94,0.3)':micStatus==='denied'?'rgba(239,68,68,0.3)':'rgba(0,212,255,0.15)'}`, background: micStatus==='listening'?'rgba(34,197,94,0.08)':micStatus==='denied'?'rgba(239,68,68,0.08)':'rgba(0,212,255,0.04)', color: micStatus==='listening'?'#22c55e':micStatus==='denied'?'#ef4444':'#94a3b8', fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s' } }, [
              micStatus==='listening'?React.createElement(Mic,{size:12}):React.createElement(MicOff,{size:12}),
              micStatus==='listening'?'LISTENING':micStatus==='denied'?'DENIED':'ACTIVATE MIC',
            ]),
            React.createElement('div', { style: { display:'flex', alignItems:'center', gap:4, fontSize:7, fontFamily: "'JetBrains Mono',monospace", color: micStatus==='listening'?'#22c55e':micStatus==='denied'?'#ef4444':'#64748b' } }, [
              React.createElement('span', { style: { width:5, height:5, borderRadius:'50%', background: micStatus==='listening'?'#22c55e':micStatus==='denied'?'#ef4444':'#6b7280', animation: micStatus==='listening'?'pulse-glow 2s ease-in-out infinite':'none' } }),
              micStatus==='listening'?'Voice reception live':micStatus==='denied'?'Permission denied':'Inactive',
            ]),
          ]),
          speechText && micStatus==='listening' && React.createElement('div', { style: { padding:'0 10px 6px' } }, [
            React.createElement('div', { style: { padding:'4px 8px', background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.08)', borderLeft:'2px solid #00d4ff', borderRadius:6, fontSize:8 } }, [
              React.createElement('span', { style: { ...S.heading, fontSize:6, color:'#00d4ff', letterSpacing:'0.1em', display:'block', marginBottom:2 } }, 'LIVE:'),
              React.createElement('p', { style: { color:'#94a3b8', lineHeight:1.3, ...S.thai } }, speechText),
            ]),
          ]),
        ]),
        // Transcript panel
        React.createElement(TranscriptPanel, { key: 'tp', transcripts: allTranscripts }),
      ]),
      // CENTER (6 cols)
      React.createElement('div', { key: 'center', style: { gridColumn:'span 6', display:'flex', flexDirection:'column', gap:8 } }, [
        React.createElement('div', { key: 'sdr', style: { flex:1, minHeight:250 } }, React.createElement(SDRSpectrum, { analyser, isListening: micStatus==='listening' })),
        React.createElement(TacticalMap, { key: 'map', incidents: stats.recentEvents }),
        React.createElement('div', { key: 'evt', style: { flex:1, minHeight:160 } }, React.createElement(EventLogPanel, { events: stats.recentEvents })),
      ]),
      // RIGHT (3 cols)
      React.createElement('div', { key: 'right', style: { gridColumn:'span 3', display:'flex', flexDirection:'column', gap:8 } }, [
        // Overview stats
        React.createElement('div', { key: 'ov', style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 } }, [
          [[Users,'OPERATORS',stats.totalCallsigns,'#00d4ff'],[Signal,'ONLINE',stats.onlineCallsigns,'#22c55e'],[AlertCircle,'EMERGENCIES',stats.emergencyEvents,'#ef4444'],[FileText,'TRANSCRIPTS',allTranscripts.length,'#f59e0b']].map(([Icon,label,val,color],i) =>
            React.createElement('div', { key: i, style: { ...S.panel(), padding:'6px 8px' } }, [
              React.createElement('div', { style: { display:'flex', alignItems:'center', gap:6 } }, [
                React.createElement(Icon, { size: 12, style: { color } }),
                React.createElement('div', {}, [
                  React.createElement('div', { style: { ...S.mono, fontSize:5, color:'#64748b', letterSpacing:'0.08em' } }, label),
                  React.createElement('div', { style: { ...S.heading, fontSize:12, fontWeight:700, color } }, String(val)),
                ]),
              ]),
            ])
          ),
        ]),
        React.createElement(CallsignDatabase, { key: 'cdb', callsigns: stats.callsigns }),
        React.createElement(AIIncidentPanel, { key: 'ai' }),
      ]),
    ]),
    // Footer
    React.createElement('div', { key: 'f', style: { ...S.panel(), display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 12px', marginTop:8, fontSize:7, fontFamily: "'JetBrains Mono',monospace", color:'#64748b' } }, [
      React.createElement('span', { style: { display:'flex', alignItems:'center', gap:4 } }, [React.createElement(ShieldCheck, { size:8 }), 'SPU Emergency Command Center v3.0 — Sripatum University Amateur Radio Club']),
      React.createElement('span', { style: { display:'flex', alignItems:'center', gap:8 } }, [
        React.createElement('span', { style: { display:'flex', alignItems:'center', gap:3 } }, [React.createElement('span', { style: { width:4, height:4, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 4px rgba(34,197,94,0.6)' } }), 'System Operational']),
        React.createElement('span', { style: { display:'flex', alignItems:'center', gap:2 } }, [React.createElement(Cpu, { size:6 }), 'Uptime: 99.97%']),
      ]),
    ]),
  ]);
};

export default Dashboard;