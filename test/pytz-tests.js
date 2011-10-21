pavlov.specify('pytz-js', function () {
    describe('Tz.dateToLocal', function () {
        it('Works well for a timezone with moving offset, during DST', function () {
            var date = Tz.dateToLocal('Europe/Warsaw',
                                      new Date(Date.UTC(2011, 9, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(9);
            assert(date.date).equals(12);
            assert(date.hours).equals(4);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for another timezone with moving offset, during DST', function () {
            var date = Tz.dateToLocal('America/New_York',
                                      new Date(Date.UTC(2011, 9, 12,
                                                        12, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(9);
            assert(date.date).equals(12);
            assert(date.hours).equals(8);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for a timezone with moving offset, out of DST', function () {
            var date = Tz.dateToLocal('Europe/Warsaw',
                                      new Date(Date.UTC(2011, 10, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(10);
            assert(date.date).equals(12);
            assert(date.hours).equals(3);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for another timezone with moving offset, out of DST', function () {
            var date = Tz.dateToLocal('America/New_York',
                                      new Date(Date.UTC(2011, 10, 12,
                                                        12, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(10);
            assert(date.date).equals(12);
            assert(date.hours).equals(7);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for UTC', function () {
            var date = Tz.dateToLocal('UTC',
                                      new Date(Date.UTC(2011, 9, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(9);
            assert(date.date).equals(12);
            assert(date.hours).equals(2);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for GMT+1', function () {
            var date = Tz.dateToLocal('Etc/GMT+1',
                                      new Date(Date.UTC(2011, 9, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(9);
            assert(date.date).equals(12);
            assert(date.hours).equals(1);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for US/Pacific border case', function () {
            // It's a partial test from pytz's localize.
            var date = Tz.dateToLocal('US/Pacific',
                                      new Date(Date.UTC(2008, 2, 9,
                                                        10, 0, 0, 0)));
            assert(date.year).equals(2008);
            assert(date.month).equals(2);
            assert(date.date).equals(9);
            assert(date.hours).equals(3);
            assert(date.minutes).equals(0);
            assert(date.seconds).equals(0);
            assert(date.milliseconds).equals(0);
        });

        it('Works well for US/Pacific border case #2', function () {
            // It's a partial test from pytz's localize.
            var date = Tz.dateToLocal('US/Pacific',
                                      new Date(Date.UTC(2008, 2, 9,
                                                        9, 0, 0, 0)));
            assert(date.year).equals(2008);
            assert(date.month).equals(2);
            assert(date.date).equals(9);
            assert(date.hours).equals(1);
            assert(date.minutes).equals(0);
            assert(date.seconds).equals(0);
            assert(date.milliseconds).equals(0);
        });

        it('Calculates day of week correctly - without crossing date line', function () {
            // Tuesday
            var date = Tz.dateToLocal('UTC',
                                      new Date(Date.UTC(2011, 9, 18,
                                                        2, 0, 0, 0)));
            assert(date.date).equals(18);
            assert(date.day).equals(2);
        });

        it('Calculates day of week correctly - with crossing date line', function () {
            // Tuesday in UTC, Monday in America/New_York
            var date = Tz.dateToLocal('America/New_York',
                                      new Date(Date.UTC(2011, 9, 18,
                                                        2, 0, 0, 0)));
            assert(date.date).equals(17);
            assert(date.day).equals(1);
        });
    });

    describe('Tz.localToDate', function () {
        it('Works well for a timezone with moving offset, during DST', function () {
            var date = Tz.localToDate('Europe/Warsaw',
                                      {year: 2011, month: 9, date: 12,
                                       hours: 4, minutes: 48, seconds: 20, milliseconds: 100})
            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(9);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(2);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(100);
        });

        it('Works well for a timezone with moving offset, out of DST', function () {
            var date = Tz.localToDate('Europe/Warsaw',
                                      {year: 2011, month: 10, date: 12,
                                       hours: 3, minutes: 48, seconds: 20, milliseconds: 100})


            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(10);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(2);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(100);
        });

        it('Works well for UTC', function () {
            var date = Tz.localToDate('UTC',
                                      {year: 2011, month: 9, date: 12,
                                       hours: 2, minutes: 48, seconds: 20, milliseconds: 100})


            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(9);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(2);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(100);
        });

        it('Works well for GMT+1', function () {
            var date = Tz.localToDate('Etc/GMT+1',
                                      {year: 2011, month: 9, date: 12,
                                       hours: 1, minutes: 48, seconds: 20, milliseconds: 100})


            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(9);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(2);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(100);
        });

        it('Handles pytz internal examples well', function () {
            // These tests are copied from docstrings in DstTzInfo.localize.

            // This method should be used to construct localtimes, rather
            // than passing a tzinfo argument to a datetime constructor.

            // is_dst is used to determine the correct timezone in the ambigous
            // period at the end of daylight savings time.

            var dt = Tz.dict(2004, 9, 31, 2, 0, 0, 0);

            var loc_dt1 = Tz.localToDate('Europe/Amsterdam', dt, true);
            assert(loc_dt1.getUTCHours()).equals(0);

            var loc_dt2 = Tz.localToDate('Europe/Amsterdam', dt, false);
            assert(loc_dt2.getUTCHours()).equals(1);

            assert(Tz.dateDiff(loc_dt2, loc_dt1)).equals(60 * 60 * 1000);

            // Use is_dst=null to raise an AmbiguousTimeError for ambiguous
            // times at the end of daylight savings
            assert(function () {
                Tz.localToDate('Europe/Amsterdam', dt, null);
            }).throwsException('AmbiguousTimeError');
            
            // is_dst defaults to False
            assert(Tz.localToDate('Europe/Amsterdam', dt) - Tz.localToDate('Europe/Amsterdam', dt, false)).equals(0);

            // is_dst is also used to determine the correct timezone in the
            // wallclock times jumped over at the start of daylight savings time.
            dt = Tz.dict(2008, 2, 9, 2, 0, 0, 0);
            var ploc_dt1 = Tz.localToDate('US/Pacific', dt, true);
            var ploc_dt2 = Tz.localToDate('US/Pacific', dt, false);
            assert(ploc_dt2 - ploc_dt1).equals(3600000);

            // Use is_dst=null to raise a NonExistentTimeError for these skipped
            // times.
            assert(function () {
                Tz.localToDate('US/Pacific', dt, null);
            }).throwsException('NonExistentTimeError');
        });

        it('Milliseconds are optional', function () {
            var date = Tz.localToDate('UTC',
                                      {year: 2011, month: 9, date: 12,
                                       hours: 4, minutes: 48, seconds: 20});
            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(9);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(4);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(0);
        });

        it('Fields other than milliseconds are obligatory', function () {
            assert(function () {
                Tz.localToDate('UTC', {month: 9, date: 12,
                                       hours: 4, minutes: 48, seconds: 20});
            }).throwsException('MissingAttribute');
            assert(function () {
                Tz.localToDate('UTC', {year: 2011, date: 12,
                                       hours: 4, minutes: 48, seconds: 20});
            }).throwsException('MissingAttribute');
            assert(function () {
                Tz.localToDate('UTC', {year: 2011, month: 9,
                                       hours: 4, minutes: 48, seconds: 20});
            }).throwsException('MissingAttribute');
            assert(function () {
                Tz.localToDate('UTC', {year: 2011, month: 9, date: 12,
                                       minutes: 48, seconds: 20});
            }).throwsException('MissingAttribute');
            assert(function () {
                Tz.localToDate('UTC', {year: 2011, month: 9, date: 12,
                                       hours: 4, seconds: 20});
            }).throwsException('MissingAttribute');
            assert(function () {
                Tz.localToDate('UTC', {year: 2011, month: 9, date: 12,
                                       hours: 4, minutes: 48});
            }).throwsException('MissingAttribute');
        });
    });

    describe('Tz.getTzInfo', function () {
        it('Throws "UnknownTimezoneError" when necessary', function () {
            assert(function () {
                Tz.getTzInfo('No/Such/Timezone');
            }).throwsException('UnknownTimezoneError');
        });
    });
});
