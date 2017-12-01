function Rect(xmin, xmax, ymin, ymax) {
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
}
Rect.prototype.xrange = function() {
    return this.xmax - this.xmin;
};
Rect.prototype.yrange = function() {
    return this.ymax - this.ymin;
};
Rect.prototype.translateX = function(dx) {
    this.xmax += dx;
    this.xmin += dx;
};
Rect.prototype.translateY = function(dy) {
    this.ymax += dy;
    this.ymin += dy;
};
Rect.prototype.toString = function() {
    return "{xi: "+this.xmin+
            ", xf: "+this.xmax+
            ", yi: "+this.ymin+
            ", yf: "+this.ymax+"}";
};

var stage;
var grid;
var curveShape;
var equation;
var mathFunc = function(x){
    return equation.eval({x: x});
};

function init(){

    $("#equation-box input").change(function(){

        try {
            var eq = math.compile( $(this).val() );
            equation = eq;
            updateGrid();
        } catch(err) {   
            console.log(err);
        }        
    });

    $("canvas").mousedown(function(){
        $("#equation-box input").blur();
    });

    equation = math.compile($("#equation-box input").val());

    stage = new createjs.Stage("root");
    grid = new createjs.Shape();
    grid.update = updateGrid;
    grid.viewrect = guessDomain(mathFunc);
    stage.addChild(grid);
    
    curveShape = new createjs.Shape();
    stage.addChild(curveShape);
    
    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();
    
    drawFunctionCurve();
    stage.on("stagemousedown", function(e){
        
        var pos = {x:stage.mouseX, y:stage.mouseY};
        var cvs = {w:stage.canvas.width, h:stage.canvas.height};
        
        stage.draglistener = 
        stage.on("stagemousemove", function(e){
            
            var dx = stage.mouseX - pos.x;
            var dy = stage.mouseY - pos.y;
            
            pos.x = stage.mouseX;
            pos.y = stage.mouseY;
            
            var scx = grid.viewrect.xrange()/cvs.w;
            var scy = grid.viewrect.yrange()/cvs.h;
            
            grid.viewrect.translateX(-dx*scx);
            grid.viewrect.translateY(dy*scy);
            grid.update();
            
        });
    });
    
    stage.on("stagemouseup", function(e){
        
        stage.off("stagemousemove", stage.draglistener);
    });
    
}
function resizeCanvas() { 
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    updateGrid();
}

function guessDomain(f){
    
    var xi = -10;
    var xf = 10;
    var n = 50;
    var dx = (xf-xi)/n;
    
    var yi, yf;
    yi = yf = f(xi);
    
    var x = xi;
    for(var i = 0; i <= n ; i++){
       
       y = f(Math.round(x*1000)/1000);
       if(isFinite(y) === false){
           x+= dx;
           continue;
       }
       
       if(y < yi){
           yi = y;
       }
       if(y > yf){
           yf = y;
       }
       
       x+= dx;
    }
    
    var yrange = yf - yi;
    var yy = yrange/5.0;
    yi -= yy;
    yf += yy;
    
    
    return new Rect(xi, xf, yi, yf);
}

function drawFunctionCurve(){
    
    var f = mathFunc;
    var scx = stage.canvas.width/grid.viewrect.xrange();
    var scy = stage.canvas.height/grid.viewrect.yrange();
    var maxy = stage.canvas.height;
    
    var rect = grid.viewrect;
    
    var N = 200;
    var step_a = rect.xrange()/N;
    var xa = rect.xmin;
    var g = curveShape.graphics;
    var started = false;
    
    g.clear();
    g.setStrokeStyle(1.5);
    g.beginStroke("blue");
    for(var i = 0; i <= N ; i++){

        var fake_x = Math.round(xa*1000)/1000;
        var fake_y = f(fake_x);
        
        if(isFinite(fake_y) === false){
            started = false;
            xa += step_a;
            continue;
        }
        
        var x = (xa - rect.xmin)*scx;
        var y = maxy - (f(xa) - rect.ymin)*scy;
        
        if(started === false){
            g.moveTo(x, y);
            started = true;
        }else{
            g.lineTo(x, y);
        }
        xa += step_a;
    } 
}

function updateGrid(){
    
    var g = grid.graphics;
    var av = grid.viewrect;
    
    var cw = stage.canvas.width;
    var ch = stage.canvas.height;
    var scx = cw/av.xrange();
    var scy = ch/av.yrange();

    var dx = caliberateUnit(av.xrange(), cw);
    var dy = caliberateUnit(av.yrange(), ch);
    
    g.clear();
    g.setStrokeStyle(0.25,"round")
     .beginStroke("gray");
    
    var cursor = 0;
    if(cursor < av.xmin){
        cursor = Math.ceil(av.xmin/dx)*dx;
    }
    while(cursor < av.xmax){
        
      var c = (cursor-av.xmin)*scx;
      g.moveTo(c,0);
      g.lineTo(c,ch);
      cursor += dx;
    }
    
    cursor = (cursor === 0) ? Math.floor(av.xmax/dx)*dx : 0;
    while(cursor > av.xmin){
      
      var c = (cursor-av.xmin)*scx;
      g.moveTo(c,0);
      g.lineTo(c,ch);
      cursor -= dx;
    }
    
    cursor = 0;
    if(cursor < av.ymin){
        cursor = Math.ceil(av.ymin/dy)*dy;
    }
    while(cursor < av.ymax){
      
      var c = (cursor-av.ymin)*scy;
      g.moveTo(0, ch-c);
      g.lineTo(cw, ch-c);
      cursor += dy;
    }
    
    cursor = (cursor === 0) ? Math.floor(av.ymax/dy)*dy : 0;
    while(cursor > av.ymin){
      
      var c = (cursor-av.ymin)*scy;
      g.moveTo(0, ch-c);
      g.lineTo(cw, ch-c);
      cursor -= dy;
    }
    
    var cx = (0 - av.xmin)*scx;
    var cy = (0 - av.ymin)*scy;
    
    
    g.setStrokeStyle(1);
    g.beginStroke("black");
    if(cx >= 0){
        g.moveTo(cx,0);
        g.lineTo(cx,ch);
    }
    if(cy >= 0){
        g.moveTo(0, ch-cy);
        g.lineTo(cw, ch-cy);
    }
    
    drawFunctionCurve();
    stage.update();
}

function caliberateUnit(range, arange){
    
    var num_max = Math.floor(arange / 20);
    var log_c = Math.floor(Math.log(range));
    var num, unit = Math.pow(10, log_c);
    var sn = 1, dv = 2, munit = unit;
    do{
        if(log_c > 1){
            log_c--;
            unit = Math.pow(10, log_c);
            munit = unit;
        }else{
            
            var sub = munit / dv;
            if(sn < dv){
                unit -= sub;
                sn++;
            }else{
                
                unit = munit;
                sn = 1;
                dv += 2;
            }
        }
        num = Math.floor(range/unit);
    }while(num < num_max);
    
    var dnum = num / num_max;
    if(dnum > 1.5 && dnum < 2.0){
       unit = unit * 1.5;
    }else if(dnum >= 2.0){
       unit = unit * 2.0;
    }
    
    return unit;
}
