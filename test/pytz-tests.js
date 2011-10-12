pavlov.specify('pytz-js', function () {
    describe('Test runner smoke check', function () {
        it('runs tests correctly', function () {
            assert(1).equals(1);
        });
    });

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
    });
});
