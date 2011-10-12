pavlov.specify('pytz-js', function () {
    describe('Test runner smoke check', function () {
        it('runs tests correctly', function () {
            assert(1).equals(1);
        });
    });

    describe('Tz.dateToLocal', function () {
        it('Works well for a timezone with moving offset', function () {
            // No tricky stuff like time change dates.
            var localTime = {year: 2011, month: 10, date: 12,
                             hours: 2, minutes: 48, seconds: 20,
                             milliseconds: 100, is_dst: True};
            var date = Tz.dateToLocal('Europe/Warsaw', localTime);
            assert(date.getUTCFullYear()).equals(2011);
            assert(date.getUTCMonth()).equals(10);
            assert(date.getUTCDate()).equals(12);
            assert(date.getUTCHours()).equals(0);
            assert(date.getUTCMinutes()).equals(48);
            assert(date.getUTCSeconds()).equals(20);
            assert(date.getUTCMilliseconds()).equals(100);
        });

        it('Works well for UTC', function () {
            var date = Tz.dateToLocal('UTC',
                                      new Date(Date.UTC(2011, 10, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(10);
            assert(date.date).equals(12);
            assert(date.hours).equals(2);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });

        it('Works well for GMT+1', function () {
            var date = Tz.dateToLocal('Etc/GMT+1',
                                      new Date(Date.UTC(2011, 10, 12,
                                                        2, 48, 20, 100)));
            assert(date.year).equals(2011);
            assert(date.month).equals(10);
            assert(date.date).equals(12);
            assert(date.hours).equals(1);
            assert(date.minutes).equals(48);
            assert(date.seconds).equals(20);
            assert(date.milliseconds).equals(100);
        });
    });
});
