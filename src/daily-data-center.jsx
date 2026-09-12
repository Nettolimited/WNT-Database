function DailyDataCenter({ camp, campPlayers }) {
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const initialDate = localDate < (camp.camp_date || localDate) ? camp.camp_date :
    (camp.camp_date_end && localDate > camp.camp_date_end ? camp.camp_date_end : localDate);
  const [date, setDate] = React.useState(initialDate);
  const [wellness, setWellness] = React.useState([]);
  const [statuses, setStatuses] = React.useState([]);
  const [schedules, setSchedules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const responses = await Promise.all([
        fetch(`/api/camp-wellness?camp_id=${camp.id}&session_date=${date}`),
        fetch(`/api/camp-status?camp_id=${camp.id}&report_date=${date}`),
        fetch(`/api/camp-schedules?camp_id=${camp.id}`),
      ]);
      if (responses.some(response => !response.ok)) throw new Error('Unable to load daily data');
      const [wellnessJson, statusJson, scheduleJson] = await Promise.all(responses.map(response => response.json()));
      setWellness(wellnessJson.entries || []);
      setStatuses(statusJson.statuses || []);
      setSchedules(scheduleJson.schedules || []);
    } catch (err) {
      console.warn('Daily Data Center unavailable:', err);
      setError('โหลดข้อมูลรายวันไม่สำเร็จ กรุณากด Refresh อีกครั้ง');
    } finally { setLoading(false); }
  }, [camp.id, date]);

  React.useEffect(() => { load(); }, [load]);

  const trainingSessions = React.useMemo(() => schedules
    .filter(item => item.schedule_date === date)
    .filter(item => /training|kick.?off|match|ฝึก|แข่งขัน/i.test(`${item.type || ''} ${item.title || ''}`))
    .map(item => (String(item.time_start || '12:00') < '12:00' ? 'AM' : 'PM'))
    .filter((value, index, values) => values.indexOf(value) === index), [schedules, date]);

  const rows = React.useMemo(() => campPlayers.map(player => {
    const entries = wellness.filter(item => item.player_id === player.id);
    const morning = entries.find(item => item.session === 'AM') || entries.find(item => item.session === 'Daily');
    const status = statuses.find(item => item.player_id === player.id);
    const away = status?.status === 'absent';
    const cannotTrain = status && (status.status === 'resting' || status.status === 'sick' ||
      (status.status === 'injured' && !isCanTrain(status.can_train)));
    const wellnessDone = !!morning && [morning.sleep, morning.stress, morning.soreness, morning.mood, morning.appetite, morning.desire].every(Number);
    const bmiDone = !!morning && Number(morning.weight_before) > 0;
    const rpeExpected = trainingSessions.length > 0 && !away && !cannotTrain;
    const rpeDone = rpeExpected && trainingSessions.every(session => entries.some(item => item.session === session && Number(item.rpe) > 0));
    const medicalCase = status && status.status && status.status !== 'available';
    return { player, status, away, wellnessDone, bmiDone, rpeExpected, rpeDone, medicalCase };
  }), [campPlayers, wellness, statuses, trainingSessions]);

  const expectedRows = rows.filter(row => !row.away);
  const count = key => expectedRows.filter(row => row[key]).length;
  const rpeExpectedCount = rows.filter(row => row.rpeExpected).length;
  const missingCount = rows.filter(row => !row.away && (!row.wellnessDone || !row.bmiDone || (row.rpeExpected && !row.rpeDone))).length;
  const labelFor = (done, row, rpe = false) => {
    if (row.away) return <span className="ddc-badge ddc-na">ไม่เข้าแคมป์</span>;
    if (rpe && !row.rpeExpected) return <span className="ddc-badge ddc-na">ไม่ได้ฝึก</span>;
    return done ? <span className="ddc-badge ddc-done">ครบ</span> : <span className="ddc-badge ddc-missing">ข้อมูลขาด</span>;
  };

  return <div className="ddc-page">
    <div className="ddc-head">
      <div><div className="sd-eyebrow">DAILY COMPLETENESS</div><h2>Daily Data Center</h2><p>ตรวจความครบของข้อมูลรายวันโดยไม่เติมค่าที่ต้นทางไม่ได้บันทึก</p></div>
      <div className="ddc-actions"><input type="date" value={date} min={camp.camp_date || ''} max={camp.camp_date_end || ''} onChange={event => setDate(event.target.value)} /><button className="btn-ghost" onClick={load}>↻ Refresh</button></div>
    </div>
    {error && <div className="ddc-error">{error}</div>}
    <div className="ddc-session-note"><strong>ตารางซ้อม:</strong> {trainingSessions.length ? trainingSessions.join(' + ') : 'ไม่มี Training/Match — วันนี้ไม่คาดหวังค่า RPE'}</div>
    <div className="ddc-cards">
      <div><span>❤️ Wellness</span><strong>{count('wellnessDone')}/{expectedRows.length}</strong><small>{expectedRows.length - count('wellnessDone')} คนยังขาด</small></div>
      <div><span>⚖️ BMI / Weight</span><strong>{count('bmiDone')}/{expectedRows.length}</strong><small>{expectedRows.length - count('bmiDone')} คนยังขาด</small></div>
      <div><span>🏃 RPE</span><strong>{rows.filter(row => row.rpeDone).length}/{rpeExpectedCount}</strong><small>อิงจาก Schedule วันนี้</small></div>
      <div><span>🤕 Injury Cases</span><strong>{rows.filter(row => row.medicalCase).length}</strong><small>เคสที่มีบันทึกสถานะ</small></div>
    </div>
    <div className="ddc-table-card">
      <div className="ddc-table-title"><strong>ตรวจรายบุคคล</strong><span className={missingCount ? 'has-missing' : ''}>{loading ? 'กำลังตรวจ…' : missingCount ? `${missingCount} คนมีข้อมูลขาด` : '✓ ข้อมูลครบตามที่คาดหวัง'}</span></div>
      <div className="ddc-table-scroll"><table className="ddc-table"><thead><tr><th>ผู้เล่น</th><th>Wellness</th><th>BMI</th><th>RPE</th><th>Medical Status</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.player.id}>
          <td><window.PlayerPhoto playerId={row.player.id} name={row.player.name} size={34}/><span><strong>{row.player.nick || row.player.name}</strong><small>{row.player.name}</small></span></td>
          <td>{labelFor(row.wellnessDone, row)}</td><td>{labelFor(row.bmiDone, row)}</td><td>{labelFor(row.rpeDone, row, true)}</td>
          <td>{row.medicalCase ? <span className="ddc-badge ddc-medical">{row.status.status}</span> : <span className="ddc-badge ddc-clear">ไม่มีเคส</span>}</td>
        </tr>)}
      </tbody></table></div>
    </div>
  </div>;
}

window.DailyDataCenter = DailyDataCenter;
