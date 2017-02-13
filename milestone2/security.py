import sys
import os
import re

check_failed = False
regexes = [
    re.compile("^.+\\.pem$"),
    re.compile("^.+\\.ppk$"),
	re.compile("^.+\\.key(pair)?$"),
    re.compile("private.*key"),
    re.compile("(oauth).*(token)")
]
key_file = 0
token_patterns = [
	re.compile("(\s|\"|'|^)[a-zA-Z0-9]{64}(\s|\"|'|$|\z)"),
	re.compile("(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])"),
	re.compile("(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])")
]
for (dirpath, dirnames, filenames) in os.walk("./"):
	for filename in filenames:
		file_path = os.path.join(dirpath, filename)
		if ('git' in file_path):
			break
		if any(regex.match(filename) for regex in regexes):
			print 'Found a possible key file: {0}\n'.format(filename)
			key_file += 1
			check_failed = True

		with open(file_path, 'r') as f:
			for line in f:
				for pattern in token_patterns:
					if (pattern.search(line)):
						print "Possible security token in line : '{0}'".format(line.rstrip(''))
						check_failed = True

#print 'Found {0} possible key files. Please do not commit any authentication key files or security tokens.\n'.format(key_file)

if(check_failed):
	sys.stderr.write( "Failing Commit. Security Risk Detected!!")
	sys.exit(1)


