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

        this.normalize = function (date) {
            return this.fromDate(date);
        };

        // Based DstTzInfo.localize.
        this.toDate = function (date_dict, is_dst) {
            var dt = Tz.dictToUtc(date_dict, -this.utcOffset * 1000);
            var dt_tsk = Tz.dateToUnixTsk(dt);
            var i;
            var day_delta = 24 * 60 * 60 * 1000;

            possible_loc_dt = []

            var deltas = [-day_delta, +day_delta];
            for (i in deltas) {
                var loc_dt = Tz.dictToUtc(date_dict, deltas[i]);
                var idx = Math.max(0, this.getRightTransitionInfo(Tz.dateToUnixTsk(loc_dt)));
                var inf = this.transitionInfo[idx];
                
                // inf[0] is utcoffset
                loc_dt = new Date(dt_tsk - inf[0] * 1000);
                if (Tz.areDateDictsEqual(this.fromDate(loc_dt), date_dict)) {
                    possible_loc_dt.push(loc_dt);
                }
            }

            // No nice sets in JS.  Implement set-like behavior
            // knowing that the array has at most 2 elements.
            if ((possible_loc_dt.length == 2)
                && (Tz.areDateDictsEqual(possible_loc_dt[0], possible_loc_dt[1])))
            {
                possible_loc_dt.pop();
            }

            if (possible_loc_dt.length == 1) {
                return possible_loc_dt[0];
            }

//            # If there are no possibly correct timezones, we are attempting
//            # to convert a time that never happened - the time period jumped
//            # during the start-of-DST transition period.
//            if len(possible_loc_dt) == 0:
//                # If we refuse to guess, raise an exception.
//                if is_dst is None:
//                    raise NonExistentTimeError(dt)
//    
//                # If we are forcing the pre-DST side of the DST transition, we
//                # obtain the correct timezone by winding the clock forward a few
//                # hours.
//                elif is_dst:
//                    return self.localize(
//                        dt + timedelta(hours=6), is_dst=True) - timedelta(hours=6)
//    
//                # If we are forcing the post-DST side of the DST transition, we
//                # obtain the correct timezone by winding the clock back.
//                else:
//                    return self.localize(
//                        dt - timedelta(hours=6), is_dst=False) + timedelta(hours=6)
//    
//    
//            # If we get this far, we have multiple possible timezones - this
//            # is an ambiguous case occuring during the end-of-DST transition.
//    
//            # If told to be strict, raise an exception since we have an
//            # ambiguous case
//            if is_dst is None:
//                raise AmbiguousTimeError(dt)
//    
//            # Filter out the possiblilities that don't match the requested
//            # is_dst
//            filtered_possible_loc_dt = [
//                p for p in possible_loc_dt
//                    if bool(p.tzinfo._dst) == is_dst
//                ]
//    
//            # Hopefully we only have one possibility left. Return it.
//            if len(filtered_possible_loc_dt) == 1:
//                return filtered_possible_loc_dt[0]
//    
//            if len(filtered_possible_loc_dt) == 0:
//                filtered_possible_loc_dt = list(possible_loc_dt)
//    
//            # If we get this far, we have in a wierd timezone transition
//            # where the clocks have been wound back but is_dst is the same
//            # in both (eg. Europe/Warsaw 1915 when they switched to CET).
//            # At this point, we just have to guess unless we allow more
//            # hints to be passed in (such as the UTC offset or abbreviation),
//            # but that is just getting silly.
//            #
//            # Choose the earliest (by UTC) applicable timezone.
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
};

