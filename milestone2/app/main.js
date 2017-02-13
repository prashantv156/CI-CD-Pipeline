var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["sample.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}


var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {},
		'path/fileWithContentExists':
		{
			'myFile': 'myContentFile'
		}

	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
  			file2: '',
		}
	}
};


function generateTestCases()
{

	var content = "var sample = require('./sample.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = [];
		}

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;

		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });

		// plug-in values for parameters
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident].push(constraint.value);
			}
		}

		var argslist = [];
		
        for (var key in params )
        {
            argslist.push(params[key]);
        }

        argsCombinations = cartesianProductOf(argslist);
       
		// Prepare function arguments.
		for (var y in argsCombinations)
		{
			// var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
			// var args = Object.keys(argsCombinations[combination]).map( function(k) {return argsCombinations[combination][k]; }).join(",");

			if( pathExists || fileWithContent )
			{
				content += generateMockFsTestCases(pathExists,fileWithContent,funcName, argsCombinations[y]);
				// Bonus...generate constraint variations test cases....
				content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, argsCombinations[y]);
				content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, argsCombinations[y]);
				content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, argsCombinations[y]);
			}
			else
			{
				// Emit simple test case.
				content += "sample.{0}({1});\n".format(funcName, argsCombinations[y]);
			}
		}

	}
			
	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}
	
	
	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsample.{0}({1});\n".format(funcName, args[x]);
	testCase+="mock.restore();\n";
	
	return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});
			
			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				
				if( child.type === 'BinaryExpression' && child.operator == "<")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)-1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}

					if (child.left.type == 'MemberExpression' && child.right.type == 'MemberExpression')
					{

						var val = [2, 3]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}

					if(child.left.type == 'MemberExpression' && child.right.type == 'Literal')
					{
						var val = [3]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2, 1]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}

				}

				if( child.type === 'BinaryExpression' && child.operator == "===")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						
						if (typeof rightHand == "integer")
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
						}

						if (typeof rightHand == "undefined")
						{
							var a;
							var val = typeof a;
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: val,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(1),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
						}						
					}

					if (child.left.type == 'UnaryExpression' && child.left.operator == 'typeof')
					{
						var expression = buf.substring(child.range[0], child.range[1]);
						

						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: params[0],
							value: [10, 20, 30],
							funcName: funcName,
							kind: "object",
							operator : child.operator,
							expression: expression
						}));

						functionConstraints[funcName].constraints.push( 
						new Constraint(
						{
							ident: params[0],
							value: ["\'dummy\'"],
							funcName: funcName,
							kind: "object",
							operator : child.operator,
							expression: expression
						}));						
					}

					if(child.left.type == 'MemberExpression' && child.right.type == 'Literal')
					{
						var val = [3, 4]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2, 1]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}	

					if (child.left.type == 'MemberExpression' && child.right.type == 'MemberExpression')
					{

						var val = [2, 2]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}


				}

				if( child.type === 'BinaryExpression' && child.operator == "!=")
				{
					
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						if (typeof rightHand == "integer")
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
						}
					}

				}				

				if( child.type === 'BinaryExpression' && child.operator == ">")
				{
					
					if( child.left.type == 'Identifier' && child.right.type == 'Literal')
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)-1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}

					if( child.left.type == 'Identifier' && child.right.type == 'Identifier')
					{
						
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt('4'),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt('7'),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.name,
								value: parseInt('2'),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.name,
								value: parseInt('3'),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}

					else if (child.left.type == 'MemberExpression' && child.right.type == 'MemberExpression')
					{

						var val = [2, 3]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}

					else if(child.left.type == 'MemberExpression' && child.right.type == 'Literal')
					{
						var val = {"a":[3, 2]}

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: [],
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));

						var val2 = [3, 2, 1]

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[0],
								value: val2,
								funcName: funcName,
								kind: "object",
								operator : child.operator,
								expression: expression
							}));
					}
				}

			});
		
			// console.log(funcName)
			// console.log(functionConstraints[funcName]);

		}
	});
}


// referred from stackoverflow - http://stackoverflow.com/questions/12303989/cartesian-product-of-multipl "objects-in-javascript
function cartesianProductOf(arguments) {
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
};


function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
