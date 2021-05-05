module.exports = {
   ReorderSchedulesFunction: `CREATE OR REPLACE FUNCTION ReorderSchedules(_chatid TEXT) RETURNS SETOF schedules AS $$
	DECLARE
    	s int;
   BEGIN
      s := 1;
      SELECT Max(num) FROM schedules WHERE chatid = _chatid INTO s;
      IF s IS NULL THEN
         s:= 1;
      END IF;
      FOR i IN REVERSE s..1 LOOP
         IF NOT EXISTS (SELECT FROM schedules WHERE chatid = _chatid AND num = i) THEN
            UPDATE schedules SET num = num - 1 WHERE chatid = _chatid AND num > i;
         END IF;
      END LOOP;
      RETURN QUERY SELECT * FROM schedules WHERE chatid = _chatid;
   END;
   $$ LANGUAGE plpgsql;`,
   ConfirmScheduleFunction: `CREATE OR REPLACE FUNCTION ConfirmSchedule(_id INT, _state TEXT, _filter_state TEXT) RETURNS VOID AS $$
   DECLARE
      s int;
      _schedule schedules;
   BEGIN
      SELECT INTO _schedule *
         FROM schedules WHERE id = _id;
      SELECT Count(*) FROM schedules WHERE (chatid = _schedule.chatid AND state = _filter_state) INTO s;
      UPDATE schedules SET 
         state = _state,
         num = s + 1
         WHERE id = _id;
   END;
   $$ LANGUAGE plpgsql;`
}