define([
    'vellum/util'
], function (
    util
) {
    // todo: abstract out IText stuff into part of the plugin interface
    var generateExportTSV = function (form) {
        var languages = form.vellum.data.javaRosa.Itext.getLanguages();

        var itextColumns = {
            "default": "Text",
            "audio": "Audio",
            "image": "Image"
        };
        
        var columnOrder = [
            "Question", 
            "Type"
        ];
        
        for (var type in itextColumns) {
            var colName = itextColumns[type];
            
            for (var i = 0; i < languages.length; i++) {
                columnOrder.push(colName + " (" + languages[i] + ")");
            }
        }

        columnOrder = columnOrder.concat([
            "Display Condition", 
            "Validation Condition", 
            "Validation Message", 
            "Calculate Condition", 
            "Required"
        ]);

        var mugToExportRow = function (mug) {
            var row = {},
                itext = mug.p.labelItextID,
                defaultLanguage = form.vellum.data.javaRosa.Itext.getDefaultLanguage(),
                i;

            var defaultOrNothing = function (item, language, form) {
                return (item && item.hasForm(form)) ? 
                    item.getForm(form).getValueOrDefault(language) : "";
            };

            // initialize all columns to empty string
            for (i = 0; i < columnOrder.length; i++) {
                row[columnOrder[i]] = "";
            }

            row.Question = form.getAbsolutePath(mug);
            row.Type = mug.typeName;

            if (!mug.options.isDataOnly) {
                for (var type in itextColumns) {
                    var colName = itextColumns[type];

                    for (i = 0; i < languages.length; i++) {
                        var key = colName + " (" + languages[i] + ")";
                        row[key] = defaultOrNothing(itext, languages[i], type);
                    }
                }
            }
            
            if (mug.p.getDefinition('relevantAttr')) {
                row["Display Condition"] = mug.p.relevantAttr;
                row["Calculate Condition"] = mug.p.calculateAttr;
                row.Required = mug.p.requiredAttr ? 'yes' : 'no';

                row["Validation Condition"] = mug.p.constraintAttr;
                row["Validation Message"] = defaultOrNothing(
                    mug.p.constraintMsgItextID,
                    defaultLanguage, 'default');
            }

            // make sure there aren't any null values
            for (var prop in row) {
                if (row.hasOwnProperty(prop)) {
                    row[prop] = row[prop] || "";
                }
            }
            
            return util.tabSeparate(columnOrder.map(function (column) {
                return row[column];
            }));
        };
     
        var headers = [util.tabSeparate(columnOrder)],
            rows = headers.concat(
                form.getMugList().map(mugToExportRow));

        return rows.join("\n");
    };

    return {
        generateExportTSV: generateExportTSV
    };
});
