var T = Array.from(new Array(9), () => new Array(9).fill(0));
var Tref = Array.from(new Array(9), () => new Array(9));
var Tsol = Array.from(new Array(9), () => new Array(9).fill(0));
var digits = new Array(10);
var hyp = false;
var hyps = []
//var coeff = [ 0, 1, 9, 81, 729, 6561, 59049, 531441, 4782969];

var curX = 0;
var curY = 0;

var col1 = "#B00";
var col2 = "#0A85FF";

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function randomOrderCells() {
    var i,j;
    var arr = []
    for (i=0;i<9;i++) {
        for (j=0;j<9;j++) {
            arr.push([i,j]);
        }
    }
    return shuffle(arr);
}

// Set cell (y,x) with value n   (0 for empty cell)
function setCell(y, x, n) {
    if (n==0) Tref[y][x].innerHTML = "";
    else Tref[y][x].innerHTML = n.toString();
}

function updateGrid() {
    var i,j;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            setCell(i,j,T[i][j]);
            Tref[i][j].style.color='';
            Tref[i][j].style.backgroundColor='';
        }
    }
}

function init() {
    var i, j;
    var tbl = document.getElementById("grid");
    for(i=0;i<9;i++) {
        var r = tbl.insertRow(-1);
        r.className = "gridRow";
        for(j=0;j<9;j++) {
            Tref[i][j] = r.insertCell(-1);
            Tref[i][j].className = "gridCell";
            if (i%3 == 0) Tref[i][j].className += " topBorder";
            if (i%3 == 2) Tref[i][j].className += " bottomBorder";
            if (j%3 == 0) Tref[i][j].className += " leftBorder";
            if (j%3 == 2) Tref[i][j].className += " rightBorder";
            var y = document.createAttribute("y");
            var x = document.createAttribute("x");
            var click = document.createAttribute("clickable");
            click.value = 0;
            y.value = i;
            x.value = j;
            Tref[i][j].setAttributeNode(y);
            Tref[i][j].setAttributeNode(x);
            Tref[i][j].setAttributeNode(click);
        }
    }
    // click on cells
    $("#grid").on("click", "td", function(e) {
        clickCell(this);
        e.stopPropagation();
    });
    // digits
    for(i=0;i<10;i++)
        digits[i] = document.getElementById("digit-"+String(i));
    // Buttons
    i = $('#digits').height();
    j = $('#buttons1').height();
    j = Math.floor( (i-j)/2 ) + 4;
    $('#buttons1').height( i-j );
    $('#buttons1').css("margin-top", String(j)+"px");
    document.getElementById("digits").style.display = "none";
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";

    setTimeout(function() { getRandomGrid(96); }, 250);
}

function allowed(A, y,x) {
    var i;
    var res = [];
    var arr = new Array(10).fill(true); 
    if (A[y][x] > 0) return res;
    for(i=0;i<9;i++) arr[A[y][i]] = false;
    for(i=0;i<9;i++) arr[A[i][x]] = false;
    for(i=0;i<9;i++)
        arr[ A[ y-(y%3) + Math.floor(i/3)][x-(x%3) + (i%3) ] ] = false;
    for(i=1;i<10;i++)
        if (arr[i]) res.push(i);
    return res;
}

function bestHypothesis(A) {
    var i,j,s;
    var bSc = 10;
    var bCoords = [9,9];
    var bAll = [];
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (A[i][j] == 0) {
                s = allowed(A, i,j);
                n = s.length;
                if (n<bSc) {
                    bSc = n;
                    bCoords = [i,j];
                    bAll = s;
                }
            }
        }
    }
    return [ bAll, bCoords[0], bCoords[1] ];
}

function _findAcceptableGrid() {
    var i;
    var [all, y, x] = bestHypothesis(T);
    if (y==9) return true;
    if (all.length==0) return false; // invalid grid
    all = shuffle(all);
    for (i=0;i<all.length;i++) {
        T[y][x] = all[i];
        if(_findAcceptableGrid()) return true;
    }
}
function findAcceptableGrid() {
    var i,j;
    for(i=0;i<9;i++) { for(j=0;j<9;j++) T[i][j] = 0; }
    while(_findAcceptableGrid() != true) {
        for(i=0;i<9;i++) { for(j=0;j<9;j++) T[i][j] = 0; }
    }
    for(i=0;i<9;i++) { for(j=0;j<9;j++) Tsol[i][j] = T[i][j]; }
}

function _findValidityClass(A, n) {
    var i;
    var sol = -1;
    var [all, y, x] = bestHypothesis(A);
    if (y==9) return 1;
    if (all.length==0) return -1; // invalid grid
    // if (all.length > 1) n++; // make a new hypothesis
    for (i=0;i<all.length;i++) {
        A[y][x] = all[i];
        r = _findValidityClass(A, n);
        A[y][x] = 0;
        if (r >= 0) {
            if (sol >= 0) return -2; // at least two solutions exist
            // sol = r;
            sol = all.length * r;
        } else if (r==-2) return -2;
    }
    return sol;
}

function _getRandomGrid2(nlevel) {
    var i, j, v, y1, x1, y2, x2, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
    for(i=0;i<9;i++) { for(j=0;j<9;j++) kept.push([i,j]); }
    findAcceptableGrid();
    for(i=0;i<nlevel;i++) {
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        T[y1][x1] = 0;
        v = _findValidityClass(T, 0);
        if(v < 0) T[y1][x1] = Tsol[y1][x1];
        else {
            sc = v; zeros.push([y1,x1]);
            kept[j] = kept[kept.length-1]; kept.pop();
        }
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        s = Math.floor(Math.random() * zeros.length);
        y2 = zeros[s][0]; x2 = zeros[s][1];
        T[y1][x1] = 0; T[y2][x2] = Tsol[y2][x2];
        v = _findValidityClass(T, 0);
        if(v < sc)
            {
                T[y1][x1] = Tsol[y1][x1];
                T[y2][x2] = 0;
            }
        else {
            sc = v;
            zeros[s] = [y1, x1];
            kept[j] = [y2, x2];
        }
    }
    return sc;
}

/*
function _getRandomGrid2(nlevel) {
    var i, j, k, v, y1, x1, y2, x2, x3, y3, s;
    var sc = -2;
    var zeros = [];
    var kept = [];
    for(i=0;i<9;i++) { for(j=0;j<9;j++) kept.push([i,j]); }
    findAcceptableGrid();
    for(i=0;i<nlevel;i++) {
        // first step
        j = Math.floor(Math.random() * kept.length);
        y1 = kept[j][0]; x1 = kept[j][1];
        T[y1][x1] = 0;
        v = _findValidityClass(T, 0);
        if(v < 0) T[y1][x1] = Tsol[y1][x1];
        else {
            sc = v; zeros.push([y1,x1]);
            kept[j] = kept[kept.length-1]; kept.pop();
        }
        // second step
        j = Math.floor(Math.random() * kept.length);
        k = Math.floor(Math.random() * (kept.length-1));
        if (j==k) k = kept.length-1;
        if (j<k) { s=j;j=k;k=s; }
        y1 = kept[j][0]; x1 = kept[j][1];
        y2 = kept[k][0]; x2 = kept[k][1];
        s = Math.floor(Math.random() * zeros.length);
        y3 = zeros[s][0]; x3 = zeros[s][1];
        T[y1][x1] = 0; T[y2][x2] = 0; T[y3][x3] = Tsol[y3][x3];
        v = _findValidityClass(T, 0);
        if(v < sc)
            {
                T[y1][x1] = Tsol[y1][x1];
                T[y2][x2] = Tsol[y2][x2];
                T[y3][x3] = 0;
            }
        else {
            sc = v;
            zeros[s] = [y1, x1]; zeros.push([y2,x2]);
            kept[j] = kept[kept.length-1]; kept.pop();
            kept[k] = [y3, x3];
        }
    }
    return sc;
}
*/

function _getRandomGrid(nlevel) {
    console.log(_getRandomGrid2(nlevel));
    updateGrid();
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (T[i][j] == 0) Tref[i][j].setAttribute("clickable", 1);
            else Tref[i][j].setAttribute("clickable", 0);
        }
    }
    // make clickable
    $( "#waiting" ).popup( "close" )
    //$.mobile.loading().hide();
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
function getRandomGrid(nlevel) {
    $( "#waiting" ).popup( "open" )
    //$.mobile.loading().show();
    setTimeout(function() { _getRandomGrid(nlevel); }, 0);
}

function elsewhere() {
    Tref[curY][curX].style.backgroundColor = "";
    document.getElementById("digits").style.display = "none";
    document.getElementById("buttons1").style.display = "inline-block";
}

function clickCell(cell) {
    var c = Number(cell.getAttribute("clickable"));
    if (c==1) {
        var y = Number(cell.getAttribute("y"));
        var x = Number(cell.getAttribute("x"));
        Tref[curY][curX].style.backgroundColor = "";
        $( "#digits" ).off("click", "**");
        curY = y;
        curX = x;
        cell.style.backgroundColor = "#BBB";
        document.getElementById("digits").style.display = "inline-block";
        document.getElementById("buttons1").style.display = "none";
        var a = allowed(T, y, x);
        var d = new Array(10).fill(false);
        for(i=0;i<a.length;i++) d[a[i]] = true;
        d[0] = true;
        for(i=0;i<10;i++) {
            if (d[i]) {
                let v = i;
                let col = (hyp)?col2:col1;
                let h = hyp;
                digits[i].style.color=col;
                digits[i].style.borderColor=col;
                $("#digits").on("click", "#digit-"+String(i), function(e) {
                    T[y][x] = v;
                    setCell(y, x, v);
                    Tref[y][x].style.color = col;
                    if (h) hyps.push(Tref[y][x]);
                    //e.stopPropagation();
                });
            } else {
                digits[i].style.color="#B8B8B8";
                digits[i].style.borderColor="#B8B8B8";
                digits[i].style.cursor="pointer";
            }
        }
    } else elsewhere();
}

function hypothesis1() {
    if(!hyp) {
        document.getElementById("but1").style.color="#B8B8B8";
        document.getElementById("but2").style.color="#000";
        document.getElementById("but3").style.color="#000";
        hyp = true;
    }
}
function hypothesis2() {
    var i;
    console.log(hyps);
    for(i=0;i<hyps.length;i++) hyps[i].style.color = col1;
    hyps = []
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
function hypothesis3() {
    var i;
    console.log(hyps);
    for(i=0;i<hyps.length;i++) {
        hyps[i].innerHTML = "";
        var y = Number(hyps[i].getAttribute("y"));
        var x = Number(hyps[i].getAttribute("x"));
        T[y][x] = 0;
    }
    hyps = []
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
function restart() {
    var i,j;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if(Number(Tref[i][j].getAttribute("clickable")) == 1) {
                T[i][j] = 0;
                setCell(i,j,0);
            }
        }
    }
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";

}
function newRandomGrid(nlevel) {
    $( "#newGrid" ).popup( "close" );
    setTimeout(function() { getRandomGrid(nlevel); }, 250);
}

function solve() {
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if (T[i][j]==0) {
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
            } else if (T[i][j] != Tsol[i][j]) {
                T[i][j] = Tsol[i][j];
                setCell(i,j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
    hyp = false;
    document.getElementById("but1").style.color="#000";
    document.getElementById("but2").style.color="#B8B8B8";
    document.getElementById("but3").style.color="#B8B8B8";
}
function check() {
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            if ((T[i][j] != Tsol[i][j])&&(T[i][j] != 0)) {
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
}
