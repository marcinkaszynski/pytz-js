var Tz = {
    timezones: {},

    addTzInfo: function (tzname, tzinfo) {
        Tz.timezones[tzname] = tzinfo;
    },

    // Constructor for a timezone that never changed its offset to
    // UTC.
    StaticTzInfo: function (utcOffset) {
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
    //
    // - the constructor is receiving two arguments that are not
    //   present in pytz: utcTransitionTimes and transitionInfo.
    //   That's because pytz initializes those class fields outside of
    //   constructor.
    DstTzInfo: function (utcTransitionTimes, transitionInfo,
                         _inf, _tzinfos) {
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

        this.fromDate = function (date, utcoffset) {
            var tsk = Tz.dateToUnixTsk(date);
            if (utcoffset === undefined) {
                var idx = Math.max(0, this.getRightTransitionInfo(tsk));
                utcoffset = this.transitionInfo[idx][0];
            }
            return Tz.utcToDict(new Date(tsk + utcoffset * 1000));
        };

        this.normalize = function (date) {
            return this.fromDate(date);
        };

        // Based DstTzInfo.localize.
        this.toDate = function (date_dict, is_dst) {
            var dt = Tz.dictToUtc(date_dict, -this.utcOffset * 1000);
            var dt_tsk = Tz.dateToUnixTsk(dt);
            var i;
            var day_delta = 24 * 60 * 60 * 1000;

            if (is_dst === undefined) {
                is_dst = false;
            }

            // Find the two best possibilities.
            var possible_loc_dt = []
            var deltas = [-day_delta, +day_delta];
            for (i in deltas) {
                var loc_dt = Tz.dictToUtc(date_dict, deltas[i]);
                var idx = Math.max(0, this.getRightTransitionInfo(Tz.dateToUnixTsk(loc_dt)));
                var inf = this.transitionInfo[idx];
                
                // TODO: the below unwinding of pytz's
                // DstTzInfo.normalize is not correct -- the tests
                // taken from DstTzInfo.localize are not working.  Fix
                // it.

                // inf[0] is utcoffset
                loc_dt = new Date(dt_tsk - inf[0] * 1000);
                if (Tz.areDateDictsEqual(this.fromDate(loc_dt, inf[0]), date_dict)) {
                    possible_loc_dt.push({dt: loc_dt,
                                          dstoffset: inf[1],
                                          tzname: inf[2]});
                }
            }

            // No nice sets in JS.  Implement set-like behavior
            // knowing that the array has at most 2 elements.
            if ((possible_loc_dt.length == 2)
                && (possible_loc_dt[0].dt - possible_loc_dt[1].dt == 0))
            {
                possible_loc_dt.pop();
            }

            if (possible_loc_dt.length == 1) {
                return possible_loc_dt[0].dt;
            }

            // If there are no possibly correct timezones, we are attempting
            // to convert a time that never happened - the time period jumped
            // during the start-of-DST transition period.
            if (possible_loc_dt.length == 0) {
                // TODO: There is a bug above that instead of this
                // case causes possible_loc_dt.length == 2.  Since I'm
                // unable to properly test the code below in this
                // branch properly, I'm cutting it short and throwing
                // an exception for now.
                throw "NonExistentTimeError";

//                // If we refuse to guess, raise an exception.
//                if (is_dst === null) {
//                    throw "NonExistentTimeError";
//                }
//                // If we are forcing the pre-DST side of the DST transition, we
//                // obtain the correct timezone by winding the clock forward a few
//                // hours.
//                else if (is_dst) {
//                    // 6 hours -- the exact value doesn't matter.
//                    var delta = 6 * 3600000;
//                    return Tz.shiftDate(this.toDate(Tz.shiftDict(date_dict, delta), is_dst),
//                                        -delta);
//                }    
//                // If we are forcing the post-DST side of the DST transition, we
//                // obtain the correct timezone by winding the clock back.
//                else {
//                    // 6 hours -- the exact value doesn't matter.
//                    var delta = 6 * 3600000;
//                    return Tz.shiftDate(this.toDate(Tz.shiftDict(date_dict, -delta), is_dst),
//                                        delta);
//                };
            }

            // If we get this far, we have multiple possible timezones - this
            // is an ambiguous case occuring during the end-of-DST transition.

            // If told to be strict, raise an exception since we have an
            // ambiguous case

            if (is_dst === null) {
                throw "AmbiguousTimeError";
            }

            // Filter out the possiblilities that don't match the requested
            // is_dst
            filtered_possible_loc_dt = [];
            for (i in possible_loc_dt) {
                if ((is_dst && (possible_loc_dt[i].dstoffset > 0)) || (!is_dst && (possible_loc_dt[i].dstoffset === 0))) {
                    filtered_possible_loc_dt.push(possible_loc_dt[i]);
                }
            }

            // Hopefully we only have one possibility left. Return it.
            if (filtered_possible_loc_dt.length === 1) {
                return filtered_possible_loc_dt[0].dt;
            }

            if (filtered_possible_loc_dt.length === 0) {
                filtered_possible_loc_dt = possible_loc_dt;
            }

            // If we get this far, we have in a wierd timezone transition
            // where the clocks have been wound back but is_dst is the same
            // in both (eg. Europe/Warsaw 1915 when they switched to CET).
            // At this point, we just have to guess unless we allow more
            // hints to be passed in (such as the UTC offset or abbreviation),
            // but that is just getting silly.
            //
            // Choose the earliest (by UTC) applicable timezone.
            //
            // TODO: finish porting it.
            //            
            // Marcin's note: this part of tzinfo.localize looks like
            // a complicated way of selecting the value with the
            // higher utcoffset.  I'll simplify it.

//            sorting_keys = {}
//            for local_dt in filtered_possible_loc_dt:
//                key = local_dt.replace(tzinfo=None) - local_dt.tzinfo._utcoffset
//                sorting_keys[key] = local_dt
//            first_key = sorted(sorting_keys)[0]
//            return sorting_keys[first_key]

        };
    },

    localToDate: function (tzname, date_dict, is_dst) {
        var tz = Tz.getTzInfo(tzname);
        return tz.toDate(date_dict, is_dst);
    },

    dateToLocal: function (tzname, date) {
        var tz = Tz.getTzInfo(tzname);
        return tz.fromDate(date);
    },

    getTzInfo: function (tzname) {
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

    areDateDictsEqual: function (date_dict_a, date_dict_b) {
        return ((date_dict_a.year === date_dict_b.year)
                && (date_dict_a.month === date_dict_b.month)
                && (date_dict_a.date === date_dict_b.date)
                && (date_dict_a.hours === date_dict_b.hours)
                && (date_dict_a.minutes === date_dict_b.minutes)
                && (date_dict_a.seconds === date_dict_b.seconds)
                && (date_dict_a.milliseconds === date_dict_b.milliseconds));
    },

    // A shortcut to create the date dict.
    dict: function (year, month, date, hours, minutes, seconds, milliseconds) {
        return {year: year, month: month, date: date,
                hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
    },

    dateDiff: function (date_a, date_b) {
        return Tz.dateToUnixTsk(date_a) - Tz.dateToUnixTsk(date_b);
    },

    // Shift the date by `delta` milliseconds.
    shiftDate: function (date, delta) {
        return new Date(Tz.dateToUnixTsk(date) + delta);
    },

    // Shift the date dict by `delta` milliseconds.
    shiftDict: function (date_dict, delta) {
        return Tz.utcToDict(Tz.dictToUtc(date_dict, delta));
    },
};

