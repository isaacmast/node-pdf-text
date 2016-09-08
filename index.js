var _ = require('lodash');
var Parser = require('pdf3json');

//clear the pdf logger
require('util')._logN = function() {};

//given a path to a pdf
//turn it into a json structure
module.exports = function(path, cb) {
    var parser = new Parser();
    parser.on('pdfParser_dataReady', function(result) {

        var text = [];

        //get text on a particular page
        result.data.Pages.forEach(function(page) {
            for (var i = 0; i < page.Texts.length; i++) {
                var chunk = {};
                chunk.y = page.Texts[i].y;
                var content = page.Texts[i].R[0];
                chunk.text = decodeURIComponent(content.T);
                if (content.TS[2] > 0) {
                    chunk.bold = true;
                } else {
                    chunk.bold = false;
                }
                text.push(chunk);
            }
        });

        parser.destroy();

        setImmediate(function() {
            cb(null, text);
        });
    });

    parser.on('pdfParser_dataError', function(err) {
        parser.destroy();
        cb(err);
    });
    if (path instanceof Buffer) {
        return parser.parseBuffer(path);
    }
    parser.loadPDF(path);
};