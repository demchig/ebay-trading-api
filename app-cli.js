var Client = require('node-rest-client').Client;
var xml2js = require('xml2js');
var fs = require('fs');
var util = require("util");

var config = require('./config.json');


if( process.argv.length < 4 ){
    console.log("Please pass callname and input json file!!");
    process.exit(1);
}

var callName = process.argv[2];
var inputFile = process.argv[3];

if( ! fs.existsSync(inputFile) ){
    console.log("Invalid file path : " + inputFile);
    process.exit(2);
}

if( ! inputFile.match(/\//) ){
    inputFile = "./" + inputFile;
}

var inputJsonObj = require(inputFile);



// direct way
client = new Client();

// registering remote methods
client.registerMethod("xmlMethod", "https://api.ebay.com/ws/api.dll", "POST");

var args = {
    headers : {
        "X-EBAY-API-CALL-NAME" : callName,
        "X-EBAY-API-SITEID" : 0,
        "X-EBAY-API-COMPATIBILITY-LEVEL" : 870,
        "Content-Type" : "text/xml"
    },
    data : ''
};

args.data = buildXmlData(callName, {
    ItemID:251636383648
});

console.log(args.data);

client.methods.xmlMethod(args, function(data,response){
    // parsed response body as js object
    console.log(data);

    xml2js.parseString(data, function(err, result){
        inspect(result);
    });
    
    // raw response
    //console.log(response);
});


/* ----------------------------------------------------------------
 * functions
 ----------------------------------------------------------------*/

 function buildXmlData(callName, jsonObj)
 {
    var builder = new xml2js.Builder({ headless : true });
    var xmlStr = builder.buildObject(jsonObj);

    var xmlData = '<?xml version="1.0" encoding="utf-8"?>'
        + '<' + callName + 'Request xmlns="urn:ebay:apis:eBLBaseComponents">'
        + '<RequesterCredentials> <eBayAuthToken>'
        + config.eBayAuthToken + '</eBayAuthToken> </RequesterCredentials>'
        + xmlStr
        + ' </' + callName + 'Request>';

    return xmlData;
 }


 function inspect(value)
 {
    console.log(util.inspect(value, false, null));
}