var Tz = {
    timezones: {},

    addTzInfo: function (tzinfo) {
        Tz.timezones[tzinfo.tzname] = tzinfo;
    },

    // Constructor for a timezone that never changed its offset to
    // UTC.
    StaticTzInfo: function (tzname, utcOffset) {
        this.tzname = tzname;
        this.utcOffset = utcOffset;

        // This is a counterpart to StaticTzInfo.fromutc.
        this.fromDate = function (date) {
            var tsk = Tz.dateToUnixTsk(date);
            return Tz.utcToDict(new Date(tsk + this.utcOffset * 1000));
        };

        this.toDate = function (date_dict) {
            var date = Tz.dictToUtc(date_dict, -this.utcOffset * 1000);
            return date;
        };

        return this;
    },

    // Constructor for a timezone that changed its offset to UTC at
    // least once.
    // 
    // This is a pretty close translation of pytz.tzinfo.DstTzInfo.
    //
    // Differences:
    //
    // - utcTransitionTimes is kept as unix timestamps instead of Date
    //   objects (simplifies things a bit at the cost of limiting
    //   working range to unix timestamps)
    DstTzInfo: function (tzname, utcTransitionTimes, transitionInfo) {
        this.tzname = tzname;
        this.utcTransitionTimes = utcTransitionTimes;
        this.transitionInfo = transitionInfo;

        this.getRightTransitionInfo = function (unix_tsk) {
            var i;
            var unix_ts = unix_tsk / 1000;
            for (i = 0; i < this.utcTransitionTimes.length; i++) {
                if (this.utcTransitionTimes[i] > unix_ts) {
                    return i - 1;
                }
            }
            return -1;
        };

        this.fromDate = function (date) {
            var tsk = Tz.dateToUnixTsk(date);
            var idx = Math.max(0, this.getRightTransitionInfo(tsk));
            return Tz.utcToDict(new Date(tsk + this.transitionInfo[idx][0] * 1000));
        };
    },

    localToDate: function (tzname, date_dict) {
        var tz = Tz.getTzinfo(tzname);
        return tz.toDate(date_dict);
    },

    dateToLocal: function (tzname, date) {
        var tz = Tz.getTzinfo(tzname);
        return tz.fromDate(date);
    },

    getTzinfo: function (tzname) {
        // TODO: raise an exception on missing tz
        return Tz.timezones[tzname];
    },

    // Return the UTC part of date as a dictionary.
    utcToDict: function (date) {
        return {year: date.getUTCFullYear(),
                month: date.getUTCMonth(),
                date: date.getUTCDate(),
                hours: date.getUTCHours(),
                minutes: date.getUTCMinutes(),
                seconds: date.getUTCSeconds(),
                milliseconds: date.getUTCMilliseconds()};
    },

    // Reverse of utcToDict.
    dictToUtc: function (date_dict, shift) {
        return new Date(Date.UTC(date_dict.year,
                                 date_dict.month,
                                 date_dict.date,
                                 date_dict.hours,
                                 date_dict.minutes,
                                 date_dict.seconds,
                                 date_dict.milliseconds) + (shift || 0));
    },

    // Convert date to unix ts multiplied by 1k to account for the milliseconds.
    dateToUnixTsk: function (date) {
        return Date.UTC(date.getUTCFullYear(),
                        date.getUTCMonth(),
                        date.getUTCDate(),
                        date.getUTCHours(),
                        date.getUTCMinutes(),
                        date.getUTCSeconds(),
                        date.getUTCMilliseconds());
    },
};

