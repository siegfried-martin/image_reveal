import random
import time
import string
import os
from datetime import datetime
from inspect import currentframe, getframeinfo

traxObj = {
    "file_name"
    "file_handle":None,
    "start_time":0,
    "last_time":0,
    "started":False
}


def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str

def start_trax():
    traxObj["file_name"] = "c:/swap/py-trax-"+get_random_string(20)+".txt"
    if os.path.exists(traxObj["file_name"]):
        os.remove(traxObj["file_name"])
    traxObj["file_handle"] = open(traxObj["file_name"], "w")
    traxObj["start_time"] = time.time()
    traxObj["last_time"] = time.time()
    traxObj["started"] = True

def trax(*argv):
    if not traxObj["started"]:
        start_trax()
    cur_time = time.time()
    message = str(datetime.now().strftime("%H:%M:%S.%f")[:-3])+" : "
    message += str(round(cur_time - traxObj["start_time"], 3))+", "
    message += str(round(cur_time - traxObj["last_time"], 3))
    traxObj["last_time"] = cur_time

    frameinfo = getframeinfo(currentframe().f_back)
    message+=" "+frameinfo.filename+"("+str(frameinfo.lineno)+") "

    for i in range(0, len(argv)):
        #print(i, argv[i])
        if i>0:
            message+=","
        message+=" ["+str(i+1)+"] => "+str(argv[i])+" ("+type(argv[i]).__name__+")"
    message+="\n"
    traxObj["file_handle"].write(message)
    traxObj["file_handle"].flush()

