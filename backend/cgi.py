# Temporary replacement for deprecated cgi module
from urllib.parse import parse_qs

def parse_header(line):
    return line, {}

def parse_multipart(fp, pdict):
    return {}, []

escape = lambda s, quote=None: str(s)  # Dummy escape
