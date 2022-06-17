function openDrawUI() {
    if  ($('#paint-controls').hasClass('hide')) {
        $('#paint-controls').removeClass('hide');
        $('.p5Canvas').removeClass('hide');
        //$("#overlay").addClass("hide");
        drawOpen =  true;   
    } else {
        $('#paint-controls').addClass('hide');
        $('.p5Canvas').addClass('hide');
        //$("#overlay").removeClass("hide");
        drawOpen =  false; 
    }
}

var canvasObj
function setup() {
    //var temp = createCanvas(windowWidth, windowHeight);
    canvasObj = createCanvas($("#image").width(), $("#image").height());
    console.log(canvasObj)
    background("rgba(255,255,255,0)");
    //background("#FFFFFF")
    $(".p5Canvas").addClass("hide")
}
var drawOpen = false;
var count = 0;
function draw() {
    
    //background("#FFFFFF")
    if (drawOpen && mouseIsPressed && !isDraggingItem) {
      pen();
    }
}

var isEraser = false
var isDisapearing = false
var disappearingLines = []
var lineObj
function pen() {
    // set the color and weight of the stroke
    stroke(0, 0, 0, 255);
    

    if (isEraser) {
        erase()
        strokeWeight(20);
    } else {
        noErase()
        strokeWeight(3);
    }

    // draw a line from current mouse point to previous mouse point
    lineObj = line(mouseX, mouseY, pmouseX, pmouseY);
    if (isDisapearing) {
        if (!disappearingLines) {
            disappearingLines.push([pmouseX, pmouseY])
        }
        disappearingLines.push([mouseX, mouseY])
    }
}

function mouseReleased() {
    if (isDisapearing) {
        makeLinesDisappear();
    }
}

function makeLinesDisappear() {
    console.log("mouseup")
    var temp = disappearingLines.slice()
    //disappearingLines = []
    window.setTimeout(function(lines){
        erase();
        strokeWeight(20);
        for (var i=1; i<lines.length; i++) {
            var cur = lines[i]
            var prev = lines[i-1]
            line(cur[0], cur[1], prev[0], prev[1])
        }
        strokeWeight(3);
        noErase();
    }, 2000, temp)
}

function changeBrushType(context) {
    var val = $(context).val()
    if (val=="normal") {
        isEraser = false
        isDisapearing = false
    } else if (val=="disappearing") {
        isEraser = false
        isDisapearing = true
    } else if (val=="eraser") {
        isEraser = true
        isDisapearing = false
    }
}

function clearDrawing() {
    canvasObj.clear()
}