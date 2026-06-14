SELECT 'Wellness count' as metric, session_date, count(*) as count, sum(case when rpe > 0 then 1 else 0 end) as rpe_count, sum(case when weight_before > 0 then 1 else 0 end) as weight_count, sum(case when sleep > 0 then 1 else 0 end) as sleep_count
FROM camp_wellness 
WHERE session_date IN ('2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07')
GROUP BY session_date;

SELECT 'GPS count' as metric, session_date, count(*) as count
FROM camp_gps
WHERE session_date IN ('2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07')
GROUP BY session_date;

SELECT 'Injury count' as metric, report_date, count(*) as count
FROM camp_player_status
WHERE report_date IN ('2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07')
GROUP BY report_date;

SELECT 'Schedule count' as metric, schedule_date, count(*) as count
FROM camp_schedules
WHERE schedule_date IN ('2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07')
GROUP BY schedule_date;
