console.log($("#image").width())
console.log($("#image").height())

$(document).ready(function(){

    $(".draggable").each(function(){
        addDraggableHandler($(this))
    })

    $("body").on("mousedown", ".icon img", function(event){
        if (event.which == 3 && !event.shiftKey) {
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

isDraggingItem = false

function addDraggableHandler(target) {
    $(target).draggable({
        start: function(event, ui) {
            isDraggingItem = true
        },
        stop: function( event, ui ) {
            isDraggingItem = false;
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
    var size = 40;
    if (info.size && info.size == "large") {
        size = 70
    }
    var image = $("<img>", {
        src: info.file,
        height: size+"px",
        width: size+"px"
    })
    icon.append(image)
    if (info.label) {
        icon.append("<br/>"+info.label)
        icon.addClass("with-label")
    } else {
        if (info.size && info.size == "large") {
            icon.addClass("large")
        } else {
            icon.addClass("small")
        }
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

var groupFacingDir
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

    if (groupFacingDir) {
        var dotProduct = movement[0] * groupFacingDir[0] + movement[1] * groupFacingDir[1];
        var magMovement = Math.sqrt(movement[0] ** 2 + movement[1] ** 2)
        var magOld = Math.sqrt(groupFacingDir[0] ** 2 + groupFacingDir[1] ** 2)
        var angle = Math.acos(dotProduct / (magMovement * magOld))
        console.log(angle)

        var targetOffset = $(target).offset()
        console.log("targetOffset", targetOffset)
        highlightedTiles.not(target).each(function(){
            var offset = $(this).offset()
            var top = targetOffset.top - offset.top
            var left = targetOffset.left - offset.left
            console.log("top", top, "left", left)
            var topRotated = (Math.cos(angle) * top) - (Math.sin(angle) * left)
            var leftRotated = (Math.sin(angle) * top) + (Math.cos(angle) * left)
            offset.top -= topRotated - top
            offset.left += leftRotated - left
            console.log("movement vector", topRotated, leftRotated)
            $(this).offset(offset)
        })
    }

   

    groupFacingDir = movement;
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
        if (!isDraggingItem && target.is(".tile")) {
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
