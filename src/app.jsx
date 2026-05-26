// Main app — composes the list and profile, owns state + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "EN",
  "density": "comfortable",
  "fontScale": 1.0,
  "palette": ["#0e1620", "#d8232a", "#2444a1"]
}/*EDITMODE-END*/;

// ── API helpers ──────────────────────────────────────────────────────────────
const api = {
  get:  (p)       => fetch(p).then(r => r.ok ? r.json() : null),
  put:  (p, body) => fetch(p, { method:'PUT',    headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }),
  post: (p, body) => fetch(p, { method:'POST',   headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }),
  del:  (p)       => fetch(p, { method:'DELETE' }),
};

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [players, setPlayers] = useState(window.TWNT_DATA.PLAYERS);
  const [clubs,   setClubs]   = useState(window.TWNT_DATA.CLUBS);
  const [selected, setSelected] = useState(null);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [apiReady, setApiReady] = useState(false);
  const [view,         setView]         = useState('dashboard'); // 'dashboard' | 'list'
  const [callupOpen,   setCallupOpen]   = useState(false);
  const [clubsOpen,    setClubsOpen]    = useState(false);
  const [matchdayOpen, setMatchdayOpen] = useState(false);
  const [videoOpen,    setVideoOpen]    = useState(false);
  const [matches,      setMatches]      = useState([]);

  const t = useI18n(tweaks.lang);

  // Sync clubs to both React state and the global (clubByCode uses window.TWNT_DATA.CLUBS)
  const updateClubs = useCallback((newClubs) => {
    window.TWNT_DATA.CLUBS = newClubs;
    setClubs([...newClubs]);
  }, []);

  // Load live data from D1 on mount
  useEffect(() => {
    // Fetch players
    api.get('/api/players').then(data => {
      if (data?.players?.length) {
        setPlayers(data.players);
        setApiReady(true);
      }
    }).catch(() => {});
    // Fetch clubs — overwrite hardcoded data.jsx defaults with live D1 data
    api.get('/api/clubs').then(data => {
      if (data?.clubs?.length) updateClubs(data.clubs);
    }).catch(() => {});
    // Fetch matches for auto-calculated stats
    api.get('/api/matches').then(data => {
      if (data?.matches) setMatches(data.matches);
    }).catch(() => {});
  }, []);

  // Compute per-player stats from match log (auto-calculated)
  const matchStats = useMemo(() => {
    const map = new Map();
    for (const m of matches) {
      if (m.is_private) continue;  // private matches don't count toward official stats
      // D1 may return lineup as a JSON string — parse it if needed
      let lineup = m.lineup || [];
      if (typeof lineup === 'string') {
        try { lineup = JSON.parse(lineup); } catch { lineup = []; }
      }
      for (const e of lineup) {
        if (!e.playerId) continue;
        // Skip bench players who genuinely didn't play (no minutes, no contribution, not marked starter)
        if (!e.minutesPlayed && !e.goals && !e.assists && !e.yellowCards && !e.redCard && !e.isStarter) continue;
        const s = map.get(e.playerId) || { apps:0, goals:0, assists:0, minutes:0, yellows:0, reds:0 };
        s.apps++;
        s.goals    += e.goals        || 0;
        s.assists  += e.assists      || 0;
        s.minutes  += e.minutesPlayed || 0;
        s.yellows  += e.yellowCards   || 0;
        if (e.redCard) s.reds++;
        map.set(e.playerId, s);
      }
    }
    return map;
  }, [matches]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = tweaks.density;
    root.style.setProperty('--font-scale', tweaks.fontScale);
    if (tweaks.palette && tweaks.palette.length >= 3) {
      root.style.setProperty('--bg-deep', tweaks.palette[0]);
      root.style.setProperty('--accent-red', tweaks.palette[1]);
      root.style.setProperty('--accent-blue', tweaks.palette[2]);
    }
  }, [tweaks.density, tweaks.fontScale, tweaks.palette]);

  const handleImport = (newPlayers) => {
    setPlayers(curr => {
      const map = new Map(curr.map(p => [p.id, p]));
      for (const np of newPlayers) {
        const existing = map.get(np.id);
        const merged = existing ? { ...existing, ...np } : np;
        if (!merged.career) merged.career = [];
        map.set(np.id, merged);
        if (apiReady) {
          existing
            ? api.put(`/api/players/${np.id}`, merged).catch(console.error)
            : api.post('/api/players', merged).catch(console.error);
        }
      }
      return Array.from(map.values());
    });
  };

  const handleExportCsv = () => downloadFile('thailand-wnt-players.csv', toCsv(players), 'text/csv');
  const handleExportXml = () => downloadFile('thailand-wnt-players.xml', toXml(players), 'application/xml');

  const handleEditPlayer = (updated) => {
    setPlayers(curr => curr.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
    if (apiReady) api.put(`/api/players/${updated.id}`, updated).catch(console.error);
  };

  const handleDeletePlayer = (id) => {
    setPlayers(curr => curr.filter(p => p.id !== id));
    setSelected(null);
    if (apiReady) api.del(`/api/players/${id}`).catch(console.error);
  };

  const handleAddPlayer = () => {
    const id = 'p_' + Date.now();
    const blank = {
      id, name: 'New Player', thaiName: '',
      pos: 'CM', altPos: [], dob: '2005-01-01', foot: 'R', height: 165,
      team: 'Senior', club: 'BG', shirt: 0, caps: 0, intGoals: 0,
      stats:    { apps:0, goals:0, assists:0, yellows:0, reds:0, minutes:0 },
      intStats: { apps:0, goals:0, assists:0, yellows:0, reds:0, minutes:0 },
      radar:    { pace:10, shooting:10, passing:10, dribbling:10, defending:10, physical:10 },
      career:   [],
    };
    if (apiReady) api.post('/api/players', blank).catch(console.error);
    setPlayers(curr => [blank, ...curr]);
    setSelected(blank);
  };

  // Shared nav handlers for Dashboard
  const dashNav = {
    onGoToPlayers: () => setView('list'),
    onMatchday:    () => { setView('list'); setMatchdayOpen(true); },
    onCallup:      () => { setView('list'); setCallupOpen(true); },
    onVideo:       () => { setView('list'); setVideoOpen(true); },
    onClubs:       () => { setView('list'); setClubsOpen(true); },
  };

  return (
    <>
      {view === 'dashboard' ? (
        <Dashboard
          players={players}
          matches={matches}
          matchStats={matchStats}
          t={t}
          onSelectPlayer={setSelected}
          {...dashNav}
        />
      ) : (
        <PlayerList
          players={players}
          matchStats={matchStats}
          onSelect={setSelected}
          onImport={handleImport}
          onExportCsv={handleExportCsv}
          onExportXml={handleExportXml}
          onAddPlayer={handleAddPlayer}
          onCallup={() => setCallupOpen(true)}
          onMatchday={() => setMatchdayOpen(true)}
          onClubs={() => setClubsOpen(true)}
          onVideo={() => setVideoOpen(true)}
          onDashboard={() => setView('dashboard')}
          t={t}
          lang={tweaks.lang}
          density={tweaks.density}
          apiReady={apiReady}
        />
      )}

      {selected && (
        <ProfilePanel
          player={selected}
          players={players}
          clubs={clubs}
          matchStats={matchStats}
          onClubsChange={updateClubs}
          onClose={() => setSelected(null)}
          onEdit={handleEditPlayer}
          onDelete={handleDeletePlayer}
          t={t}
          density={tweaks.density}
        />
      )}

      {callupOpen && (
        <CallupPanel
          players={players}
          onClose={() => setCallupOpen(false)}
          t={t}
        />
      )}

      {matchdayOpen && (
        <MatchdayPanel
          players={players}
          onClose={() => setMatchdayOpen(false)}
          onMatchesChange={setMatches}
          t={t}
        />
      )}

      {videoOpen && (
        <VideoPanel
          players={players}
          onClose={() => setVideoOpen(false)}
        />
      )}

      {clubsOpen && (
        <ClubsPanel
          clubs={clubs}
          onClubsChange={updateClubs}
          onClose={() => setClubsOpen(false)}
          t={t}
        />
      )}

      <TweaksPanel title={t('tweaks_title')}>
        <TweakSection label="Display"/>
        <TweakRadio label="Language" value={tweaks.lang} options={['EN', 'TH']}
          onChange={v => setTweak('lang', v)}/>
        <TweakRadio label="Density" value={tweaks.density} options={['comfortable', 'compact']}
          onChange={v => setTweak('density', v)}/>
        <TweakSlider label="Font scale" value={tweaks.fontScale} min={0.85} max={1.25} step={0.05}
          unit="×" onChange={v => setTweak('fontScale', v)}/>

        <TweakSection label="Theme"/>
        <TweakColor label="Palette" value={tweaks.palette}
          options={[
            ['#0e1620', '#d8232a', '#2444a1'],
            ['#0a0d14', '#e6394a', '#3b6fcc'],
            ['#1a0d0d', '#e8323a', '#1d4eaa'],
            ['#0c1330', '#e44a52', '#5079d8'],
            ['#16161d', '#ef4f57', '#8a6cf4'],
          ]}
          onChange={v => setTweak('palette', v)}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
