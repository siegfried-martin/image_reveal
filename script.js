console.log($("#image").width())
console.log($("#image").height())

$(document).ready(function(){

    $(".draggable").each(function(){
        addDraggableHandler($(this))
    })

    $(".icon img").mousedown(function(event){
        if (event.which == 3) {
            $(this).toggleClass("upside-down")
        }
        
    })

    $("body").on("click", ".icon", function(e) {
        if (e.shiftKey) {
            highlightTile($(this))
        }
    })

    $("body").on("mousedown", ".icon", function(e) {
        if (e.shiftKey && e.which == 3) {
            removeHighlights()
        }
    })

    window.setTimeout(function(){
        setupOverlay()
        attachShowHideTileEvents()
        setupIconPicker()
        $("#image-container").removeClass("hidden")
    }, 500);

    document.addEventListener("contextmenu", function (e){
        e.preventDefault();
    }, false);
});

function addDraggableHandler(target) {
    $(target).draggable({
        stop: function( event, ui ) {
            console.log("event", event)
            console.log("ui", ui)
            if ($(this).parent().is("#icons")) {
                var offset = $(this).offset()
                $(this).detach()
                $("#image-container").append($(this))
                $(this).offset(offset)
            } else if ($(this).hasClass("highlighted")) {
                movehighlightedGroup(event, ui)
            }
            if (isInTrash($(this))) {
                $(this).remove();
            }
        }
    })
}

function isInTrash(target) {
    var offset1 = target.offset()
    var offset2 = $("#trash").offset()
    console.log(offset1, offset2, offset1.top - offset2.top, offset1.left - offset2.left)
    if (Math.abs(offset1.top - offset2.top) < 50 && 
        Math.abs(offset1.left - offset2.left) < 50) {
            return true;
        }
    return false;
}

var iconPicker
function setupIconPicker() {
    iconPicker = $("#icon-picker").autocomplete({
        delay: 100,
        minlength: 2,
        source: Object.keys(Images),
        select: createIconEvent
    });
}

function createIconEvent(event, ui) {
    var target = $(event.target)
    var val = ui.item.value
    var info = Images[val]
    var icon = $("<div>", {
        class: "icon draggable",
    })
    var image = $("<img>", {
        src: info.file,
        height: "40px",
        width: "40px"
    })
    icon.append(image)
    if (info.label) {
        icon.append("<br/>"+info.label)
    } else {
        icon.addClass("small")
    }
    $("#icons").append(icon)
    addDraggableHandler(icon)

    target.val("")
    event.stopPropagation;
    return false
}

var highlightedTiles = $([]);

function highlightTile(target) {
    if (target.hasClass("highlighted")) {
        target.removeClass("highlighted");
        highlightedTiles = highlightedTiles.not(target);
    } else {
        target.addClass("highlighted");
        highlightedTiles = highlightedTiles.add(target);
    }
}

function removeHighlights() {
    $(".highlighted").removeClass("highlighted");
    highlightedTiles = $([]);
}

function movehighlightedGroup(event, ui) {
    var target = event.target;
    var movement = [
       ui.position.top -  ui.originalPosition.top,
        ui.position.left - ui.originalPosition.left,
    ];

    highlightedTiles.not(target).each(function(){
        var offset = $(this).offset()
        offset.top += movement[0];
        offset.left += movement[1];
        $(this).offset(offset);
    })
}

function setupOverlay() {
    console.log($("#image").width())
    console.log($("#image").height())

    var pixelWidth = $("#image").width();
    var pixelHeight = $("#image").height();
    var tileWidth = 15;
    var tileHeight = 15;

    var rows = pixelHeight / tileHeight;
    var cols = pixelWidth / tileWidth;
    console.log("cols: ", cols)

    for (var i=0; i < rows; i++) {
        $tr = $("<div/>", {class: "row"})
        $tr.attr("draggable", "false")
        $("#overlay-table").append($tr)
        for (var j=0; j < cols; j++) {
            $td = $("<div/>", {class: "tile"})
            $td.attr("draggable", "false")
            $tr.append($td)
        }
    }

    
}

var rectangleAnchor;
var rectangleEnd;
var ctrlRectangle
var isCtrlTileEvent = false;

function destroyRectangle() {
    if (ctrlRectangle) {
        ctrlRectangle.remove();
    }
    isCtrlTileEvent = false;
}

function attachShowHideTileEvents() {
    $("#overlay-table").mousedown(function(event){
        var target = $(event.target)
        if (event.ctrlKey && target.is(".tile")) {
            isCtrlTileEvent = true;
            rectangleAnchor = target;
        }
    });

    $("#overlay-table").mouseup(function(event){
        var target = $(event.target)
        if (isCtrlTileEvent) {
            destroyRectangle();
            if (rectangleAnchor && rectangleEnd) {
                if (event.which == 1) {
                    showRectangle();
                } else if (event.which == 3) {
                    hideRectangle();
                }
            }
        }
    });

    $("#overlay-table").mouseover(function(event){
        var target = $(event.target)
        if (target.is(".tile")) {
            if (event.which == 1) {
                if (isCtrlTileEvent) {
                    rectangleEnd = target;
                    moveRectangle()
                } else {
                    showTile(target);
                    destroyRectangle();
                }
            } else if (event.which == 3) {
                if (isCtrlTileEvent) {
                    rectangleEnd = target;
                    moveRectangle()
                } else {
                    hideTile(target);
                    destroyRectangle();
                }
            } else if (isCtrlTileEvent) {
                destroyRectangle();
            } 
        } 
    });
}

var brushWidth = 1
function setBrushWidth(n) {
    brushWidth = n;
}

function showTile(target) {
    //target.addClass("hidden")
    var columnIndex = target.index()
    var row = target.parent()
    var rowIndex = row.index()
    var table = row.parent()

    for (var i = rowIndex - brushWidth; i <= rowIndex + brushWidth; i++) {
        for (var j = columnIndex - brushWidth; j <= columnIndex + brushWidth; j++) {
            table.find(".row").eq(i).find(".tile").eq(j).addClass("hidden")
        }
    }
}

function hideTile(target) {
    //target.addClass("hidden")
    var columnIndex = target.index()
    var row = target.parent()
    var rowIndex = row.index()
    var table = row.parent()

    for (var i = rowIndex - brushWidth; i <= rowIndex + brushWidth; i++) {
        for (var j = columnIndex - brushWidth; j <= columnIndex + brushWidth; j++) {
            table.find(".row").eq(i).find(".tile").eq(j).removeClass("hidden")
        }
    }
}

function showRectangle() {
    var startColumnIndex = rectangleAnchor.index()
    var startRow = rectangleAnchor.parent()
    var startRowIndex = startRow.index()
    var table = startRow.parent()
    var endColumnIndex = rectangleEnd.index()
    var endRowIndex = rectangleEnd.parent().index()
    var temp

    if (startColumnIndex > endColumnIndex) {
        temp = startColumnIndex;
        startColumnIndex = endColumnIndex;
        endColumnIndex = temp
    }
    if (startRowIndex > endRowIndex) {
        temp = startRowIndex;
        startRowIndex = endRowIndex;
        endRowIndex = temp
    }

    for (var i = startRowIndex; i <= endRowIndex; i++) {
        for (var j = startColumnIndex; j <= endColumnIndex; j++) {
            table.find(".row").eq(i).find(".tile").eq(j).addClass("hidden")
        }
    }
}

function hideRectangle() {
    var startColumnIndex = rectangleAnchor.index()
    var startRow = rectangleAnchor.parent()
    var startRowIndex = startRow.index()
    var table = startRow.parent()
    var endColumnIndex = rectangleEnd.index()
    var endRowIndex = rectangleEnd.parent().index()

    for (var i = startRowIndex; i <= endRowIndex; i++) {
        for (var j = startColumnIndex; j <= endColumnIndex; j++) {
            table.find(".row").eq(i).find(".tile").eq(j).removeClass("hidden")
        }
    }
}

function moveRectangle() {
    if (ctrlRectangle) {
        ctrlRectangle.remove()
    }
    var anchorPos = rectangleAnchor.offset();
    var endPos = rectangleEnd.offset();
    var top = (anchorPos.top <= endPos.top) ? anchorPos.top : endPos.top
    var left = (anchorPos.left <= endPos.left) ? anchorPos.left : endPos.left
    var height = Math.abs(endPos.top - anchorPos.top);
    var width = Math.abs(endPos.left - anchorPos.left);

    if (height == 0 || width == 0) {
        return;
    }

    ctrlRectangle = $("<div>", {
        class: "ctrl-rectangle",
        css: {top: top+"px", left: left+"px"},
        height: height,
        width: width
    });
    //ctrlRectangle.appendTo("#image-container")
    ctrlRectangle.appendTo("#overlay-table")
}
