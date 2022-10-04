var TEXT_TRM = '049';
var TEXT_ZBE = '026';


function check() {
    var result = false;
    var textTrm = app.activeDocument.textFrames.itemByName(TEXT_TRM);
    var textZbe = app.activeDocument.textFrames.itemByName(TEXT_ZBE);
    if (textTrm.isValid || textZbe.isValid) {
        result = true;
    }
    return result;
}

function deleteRows() {
    var textTrm = app.activeDocument.textFrames.itemByName(TEXT_TRM);
    var textZbe = app.activeDocument.textFrames.itemByName(TEXT_ZBE);
    var table = app.activeDocument.tables[0];
    var rows = table.rows;
    var rowsToDelete = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.cells;
        var cellTrm = cells[0];
        var cellZbe = cells[1];
        if (cellTrm.contents !== textTrm.contents || cellZbe.contents !== textZbe.contents) {
            rowsToDelete.push(row);
        }
    }
    for (var j = 0; j < rowsToDelete.length; j++) {
        rowsToDelete[j].remove();
    }
}

function main() {
    if (check()) {
        deleteRows();
    }
}

main();
