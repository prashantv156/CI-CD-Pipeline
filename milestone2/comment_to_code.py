import sys

file = open(sys.argv[1])

comment_lines = 0
code_lines = 0
comment_types = ('//', '/*', '*/')
check = False
comment_start = False
limit = 0.5

for statement in file:
    if any(comment in statement for comment in comment_types):
        check = True
    
    if(check):
        if comment_types[0] in statement:
            comment_lines += 1
        elif comment_types[1] in statement:
            comment_lines += 1
            comment_start = True     
        elif (comment_start and (comment_types[2] in statement)):
            comment_lines += 1
            comment_start = False
        
    else:
        code_lines += 1
    check = False

rvalue = float(comment_lines)/ float(code_lines)

print ("----------------------------------------------------------------------------------------")
print ("\nRatio of Comments to Code = {0}:{1} = {2}\n".format(comment_lines,code_lines, rvalue))
print ("----------------------------------------------------------------------------------------")

if(rvalue > limit):
    sys.stderr.write ("----------------------------------------------------------------------------------------")
    sys.stderr.write("\nThe comment to code ratio exceeds the permissible limit of %f. Please refactor the code. \n" % limit)
    sys.exit(1)
