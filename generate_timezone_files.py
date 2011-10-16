#!/usr/bin/python
"""
Generate all the files with timezone information.

I'm saving myself a lot of work, at least for now, by having pytz do
all the work on parsing Olson data files.
"""

import os
import os.path
import pytz
import calendar
from pytz.tzinfo import StaticTzInfo, DstTzInfo

def delta_to_seconds(delta):
    return delta.days * 86400 + delta.seconds

def date_to_unixts(date):
    return calendar.timegm(date.utctimetuple())

def dump_tzinfo(tzname):
    tz = pytz.timezone(tzname)

    if issubclass(type(tz), DstTzInfo):
        trans_times = []
        trans_info = []
        for idx, tt in enumerate(tz._utc_transition_times):
            if tt.year >= 1970:
                trans_times.append(int(date_to_unixts(tt)))
                (utcoffset, dstoffset, tzname) = tz._transition_info[idx]
                trans_info.append([delta_to_seconds(utcoffset), delta_to_seconds(dstoffset), tzname])
        return ("new Tz.DstTzInfo(%s,\n %s)"
                % (trans_times, trans_info))
    else:
        return ("new Tz.StaticTzInfo(%s)"
                % (delta_to_seconds(tz._utcoffset)))
    
def generate_file(out_dir, tzname):
    file_path = os.path.join(out_dir, tzname + '.js')
    (dirname, filename) = os.path.split(file_path)
    if not os.path.isdir(dirname):
        os.makedirs(dirname)

    open(file_path, 'w').write("Tz.addTzInfo('%s', %s)"
                               % (tzname, dump_tzinfo(tzname)))

def generate_all_files(out_dir):
    for tzname in pytz.all_timezones:
        generate_file(out_dir, tzname)

generate_all_files(out_dir='./js/zones/')

