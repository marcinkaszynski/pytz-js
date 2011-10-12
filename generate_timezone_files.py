#!/usr/bin/python
"""
Generate all the files with timezone information.

I'm saving myself a lot of work, at least for now, by having pytz do
all the work on parsing Olson data files.
"""

import os
import os.path
import pytz
import time
from pytz.tzinfo import StaticTzInfo, DstTzInfo

def delta_to_seconds(delta):
    return delta.days * 86400 + delta.seconds

def date_to_unixts(date):
    return time.mktime(date.timetuple())

def dump_tzinfo(tzname):
    tz = pytz.timezone(tzname)

    if issubclass(type(tz), DstTzInfo):
        return ("new Tz.DstTzInfo('%s', %s,\n %s,\n %s)"
                % (tzname,
                   [int(date_to_unixts(tt))
                    for tt in tz._utc_transition_times
                    if tt.year >= 1970],
                   [[delta_to_seconds(utcoffset), delta_to_seconds(dstoffset), tzname]
                    for (utcoffset, dstoffset, tzname) in tz._transition_info],
                   delta_to_seconds(tz._dst)))
    else:
        return ("new Tz.StaticTzInfo('%s', %s)"
                % (tzname, delta_to_seconds(tz._utcoffset)))
    
def generate_file(out_dir, tzname):
    file_path = os.path.join(out_dir, tzname + '.js')
    (dirname, filename) = os.path.split(file_path)
    if not os.path.isdir(dirname):
        os.makedirs(dirname)

    open(file_path, 'w').write("Tz.addTzInfo(%s)" % dump_tzinfo(tzname))

def generate_all_files(out_dir):
    for tzname in pytz.all_timezones:
        generate_file(out_dir, tzname)

generate_all_files(out_dir='./js/zones/')

