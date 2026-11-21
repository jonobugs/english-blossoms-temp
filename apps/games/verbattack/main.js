"use strict";
/********************************************************************
*
*                    creating a Verb Attack Game
* version: 1.0
* September 7, 2020
* Jonathan Hamelin
*********************************************************************/


var verbs = ["climb.png", "comeOut.png", "cry.png", "dream.png", "drink.png", "drum.png", "eat.png", "fall.png", "fly.png", "jumpOut.png", "paint.png", "play.png", "read.png", "run.png", "sing.png", "sit.png", "ski.png", "sleep.png", "smile.png", "speak.png", "stand.png", "swim.png", "teach.png", "throw.png", "walk.png"]

var verbs2 = ["climb.png", "comeOut.png", "cry.png", "dream.png", "drink.png", "drum.png", "eat.png", "fall.png", "fly.png", "jumpOut.png", "paint.png", "play.png", "read.png", "run.png", "sing.png", "sit.png", "ski.png", "sleep.png", "smile.png", "speak.png", "stand.png", "swim.png", "teach.png", "throw.png", "walk.png"]

var emojis = ["<i class = 'fas fa-smile-wink'></i>", "<i class = 'fas fa-poo'></i>", "<i class = 'fas fa-smile-beam'></i>", "<i class = 'fas fa-grin-beam'></i>", "<i class = 'fas fa-grin-wink'></i>", "<i class = 'fas fa-grin-squint-tears'></i>", "<i class = 'fas fa-grin-squint'></i>", "<i class = 'fas fa-grin-hearts'></i>", "<i class = 'fas fa-grin-beam-sweat'></i>", "<i class = 'fas fa-grin-alt'></i>", "<i class = 'fas fa-laugh-wink'></i>", "<i class = 'fas fa-laugh-squint'></i>", "<i class = 'fas fa-laugh-beam'></i>", "<i class = 'fas fa-laugh'></i>", "<i class = 'fas fa-kiss-beam'></i>", "<i class = 'fas fa-kiss-wink-heart'></i>", "<i class = 'fas fa-grin-tongue-wink'></i>", "<i class = 'fas fa-kiss-beam'></i>", "<i class = 'fas fa-surprise'></i>", "<i class = 'fas fa-meh-rolling-eyes'></i>", "<i class = 'fas fa-grin-stars'></i>", "<i class = 'fas fa-kiss'></i>", "<i class = 'fas fa-dizzy'></i>", "<i class = 'fas fa-flushed'></i>", "<i class = 'fas fa-hand-peace'></i>"]


var centipedeArray = [["a0", "a1", "a2"], ["a1", "a2", "a3"], ["a2", "a3", "a4"], ["a5", "a6", "a7"], ["a6", "a7", "a8"], ["a7", "a8", "a9"], ["a10", "a11", "a12"], ["a11", "a12", "a13"], ["a12", "a13", "a14"], ["a15", "a16", "a17"], ["a16", "a17", "a18"], ["a17", "a18", "a19"], ["a21", "a22", "a23"], ["a22", "a23", "a24"], ["a20", "a21", "a22"], ["a0", "a5", "a10"], ["a5", "a10", "a15"], ["a10", "a15", "a20"], ["a1", "a6", "a11"], ["a6", "a11", "a16"], ["a11", "a16", "a21"], ["a2", "a7", "a12"], ["a7", "a12", "a17"], ["a12", "a17", "a22"], ["a3", "a8", "a13"], ["a8", "a13", "a18"], ["a13", "a18", "a23"], ["a4", "a9", "a14"], ["a9", "a14", "a19"], ["a14", "a19", "a24"], ["a2", "a8", "a14"], ["a1", "a7", "a13"], ["a7", "a13", "a19"], ["a0", "a6", "a12"], ["a6", "a12", "a18"], ["a12", "a18", "a24"], ["a5", "a11", "a17"], ["a11", "a17", "a23"], ["a10", "a16", "a22"], ["a2", "a6", "a10"], ["a3", "a7", "a11"], ["a7", "a11", "a15"], ["a4", "a8", "a12"], ["a8", "a12", "a16"], ["a12", "a16", "a20"], ["a9", "a13", "a17"], ["a13", "a17", "a21"], ["a14", "a18", "a22"]];

var caterpillarArray = [["a0", "a1"], ["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a5", "a6"], ["a6", "a7"], ["a7", "a8"], ["a8", "a9"], ["a10", "a11"], ["a11", "a12"], ["a12", "a13"], ["a13", "a14"], ["a15", "a16"], ["a16", "a17"], ["a17", "a18"], ["a18", "a19"], ["a20", "a21"], ["a21", "a22"], ["a22", "a23"], ["a23", "a24"], ["a0", "a5"], ["a5", "a10"], ["a10", "a15"], ["a15", "a20"], ["a1", "a6"], ["a6", "a11"], ["a11", "a16"], ["a16", "a21"], ["a2", "a7"],[ "a7", "a12"], ["a12", "a17"], ["a17", "a22"], ["a3", "a8"], ["a8", "a13"], ["a13", "a18"], ["a18", "a23"], ["a4", "a9"], ["a9", "a14"], ["a19", "a24"], ["a1", "a5"], ["a2", "a6"], ["a6", "a10"],[ "a3", "a7"], ["a7", "a11"], ["a11", "a15"], ["a4", "a8"], ["a8", "a12"], ["a12", "a16"], ["a16", "a20"], ["a9", "a13"], ["a13", "a17"], ["a17", "a21"], ["a14", "a18"], ["a18", "a22"], ["a19", "a23"], ["a3", "a9"], ["a2", "a8"], ["a8", "a14"], ["a1", "a7"], ["a7", "a13"], ["a13", "a19"], ["a0", "a6"], ["a6", "a12"], ["a12", "a18"], ["a18", "a24"], ["a5", "a11"], ["a11", "a17"], ["a17", "a23"], ["a10", "a16"], ["a16", "a22"], ["a15", "a21"]];

var mosquitoArray = ["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14", "a15", "a16", "a17", "a18", "a19", "a20", "a21", "a22", "a23", "a24"];

function $(id) {
    return document.getElementById(id);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//to play sounds
function playSound(array, num, dir, ext){
    
    //Note: sound cannot be played upon load. User needs to click a button
    
    //Need to use Audio() to change to a new sound.
    let audio = new Audio(dir+array[num]+ext);
    audio.play()
}

var sound = ["miss", "hit", "win"];

let bingoLen = verbs.length;
let array1 = verbs;
let array2 = verbs2;
let smiley = [];

play(array1, array2);


function play(array1, array2) {
    shuffle(array1);
    shuffle(array2);
    
    //populate the Bingo Squares
for (let m = 0; m < bingoLen; m++) {
    $("a" + m).src = "img/" + array1[m];
    $("b" + m).src = "img/" + array2[m];
}}

function getRandom(array){
     return Math.floor(Math.random() * array.length);
}

//grabs random element from given array
function getInsect(array) {
    return array[getRandom(array)];
}

/* function to change the 'a's to 'b's in an array*/
function change(arr) {
    return arr.map(a=> a.replace(/a/g, "b"))
}

/*****************************************************
* declaring the variables for the insects
******************************************************/

let hitCount = 0;
let hitCount2 = 0;

/***********************************************
*        Getting insects for left side
************************************************/
let centipede = getInsect(centipedeArray);
let caterpillar = getInsect(caterpillarArray);

//making sure they are on different spots
compare("a", caterpillar, centipede);

//getting mosquites AFTER we know there is no conflict
let mosquito1 = getInsect(mosquitoArray);
let mosquito2 = getInsect(mosquitoArray);

//making sure they mosquitos are on different spots
compareMosquito("a", mosquito1, mosquito2, centipede, caterpillar);

/***********************************************
*        Getting insects for right side
************************************************/

let centipede2 = getInsect(centipedeArray);
let caterpillar2 = getInsect(caterpillarArray);

//making sure they are on different spots
compare("b", caterpillar2, centipede2);

//getting mosquites AFTER we know there is no conflict
let mosquito3 = getInsect(mosquitoArray);
let mosquito4 = getInsect(mosquitoArray);

//making sure they mosquitos are on different spots
compareMosquito("b", mosquito3, mosquito4, centipede2, caterpillar2);

//need to change all the a-s b-s use function change
centipede2 = change(centipede2);
caterpillar2 = change(caterpillar2);

//changing the strings from a to b
mosquito3 = mosquito3.split("a").join("b");
mosquito4 = mosquito4.split("a").join("b");

/************************************************/

//console.log("A: ", centipede, caterpillar, mosquito1, mosquito2);
//console.log("B: ", centipede2, caterpillar2, mosquito3, mosquito4);

//function to check whether or not caterpillar and centipede occupy the same spot
function compare(set, arr1, arr2) {
    let len1 = arr1.length;
  
    //if caterpillar is in the same spot as centipede, find a new spot
    for(let i = 0;i < len1; i++){
        if(arr2.includes(arr1[i])){
            //get a new spot for caterpillar
            if(set === "a") {
                caterpillar = getInsect(caterpillarArray);
                compare("a", caterpillar, centipede);     
            } else if(set === "b") {
                caterpillar2 = getInsect(caterpillarArray);
                compare("b", caterpillar2, centipede2);     
            }
            
        } 
    }
}


function replace(id, img) {
    $(id).src = "img/" + img;
}

function replaceText(id, text){
    $(id).innerHTML = text;
}

function whichImage(num, str) {
    return str + str[str.length-1].repeat(num-1);
}

/**************************************** 
* declaring variables to count the hits *
*****************************************/

let centipedeHit = 0;
let centipedeHit2 = 0;
let caterPillarHit = 0;
let caterPillarHit2 = 0;
let mosquitoA = 0;
let mosquitoB = 0;

// ==================== SCORING ====================
// +1 for every insect square hit, +2 bonus when an insect is completely destroyed
let score = { a: 0, b: 0 };

function addScore(set, points) {
    score[set] += points;
    let el = $(set == "a" ? "score1" : "score2");
    el.textContent = score[set];
    playAnim(el, "score-pop");
}

// ==================== HIT EFFECTS ====================
let gameOver = false;
let hitSquares = {};   // remembers which squares have been chosen (true = hit, false = miss)
let reveals = [];      // insect pictures left on the board after a kill

const HIT_DURATION = 1300;     // ms - matches --hit-dur in main.css
const REVEAL_DELAY = 1100;     // ms - wait for the hit animation before revealing a dead insect

/* restarts a CSS animation on an element */
function playAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;            // forces the browser to restart the animation
    el.classList.add(cls);
    el.addEventListener("animationend", function done(e) {
        if (e.target !== el) return;
        el.classList.remove(cls);
        el.removeEventListener("animationend", done);
    });
}

/* jiggle the picture and flash the square when it is hit */
function hitEffect(id) {
    playAnim($(id), "hit-jiggle");
    playAnim($(id).parentElement, "hit-flash");
}

/* Centipede / caterpillar segment: the insect rises out of the square, fades,
   then comes back as a faded mark that stays on the square (not rotated, so it gives no direction clue) */
function spawnSegmentIcon(id, type) {
    let icon = document.createElement("img");
    icon.src = "img/" + type + ".png";

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        icon.className = "segment-icon segment-mark";
    } else {
        icon.className = "segment-icon segment-rise";
        icon.addEventListener("animationend", function (e) {
            if (e.animationName !== "segment-rise") return;
            icon.className = "segment-icon segment-mark";
        });
    }
    $(id).parentElement.appendChild(icon);
}

/* position (or re-position after a resize) a revealed insect over its squares */
function placeReveal(r) {
    let first = $(r.squares[0]).getBoundingClientRect();
    let last = $(r.squares[r.squares.length - 1]).getBoundingClientRect();
    let cx1 = first.left + first.width / 2, cy1 = first.top + first.height / 2;
    let cx2 = last.left + last.width / 2,   cy2 = last.top + last.height / 2;
    let dist = Math.hypot(cx2 - cx1, cy2 - cy1);

    // angle along the squares (insects are drawn horizontally, head on the left)
    let angle = Math.atan2(cy2 - cy1, cx2 - cx1) * 180 / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle <= -90) angle += 180;

    r.el.style.width = (dist + Math.min(first.width, first.height) * 0.95) + "px";
    r.el.style.left = ((cx1 + cx2) / 2 + window.scrollX) + "px";
    r.el.style.top = ((cy1 + cy2) / 2 + window.scrollY) + "px";
    r.el.style.setProperty("--rot", angle + "deg");
}

window.addEventListener("resize", function () {
    reveals.forEach(placeReveal);
});

/* Shows an insect over its squares.
   - normal kill: flash, starts solid, fades to 50% and stays
   - missed=true: used when the game ends, to show where an unfound insect was hiding */
function revealInsect(squares, type, missed) {
    setTimeout(function () {
        squares.forEach(function (sq) {
            let cell = $(sq).parentElement;
            // the full picture replaces the small per-square marks
            cell.querySelectorAll(".segment-icon").forEach(function (i) { i.remove(); });
            playAnim(cell, "found-flash");
        });

        let img = document.createElement("img");
        img.src = "img/" + type + ".png";
        img.className = "reveal-insect" + (missed ? " missed" : "");
        let r = { el: img, squares: squares };
        placeReveal(r);
        document.body.appendChild(img);
        reveals.push(r);
    }, missed ? 0 : REVEAL_DELAY);
}

/* true if every square in the list has been hit */
function allHit(squares) {
    return squares.every(function (sq) { return hitSquares[sq]; });
}

/* top bar: smaller text plus one small insect icon per hit */
function setHead(head, text, type, count) {
    let html = '<span class="msg">' + text + '</span>';
    if (type) {
        html += '<span class="hit-icons">' +
                ('<img src="img/' + type + '.png" alt="">').repeat(count) +
                '</span>';
    }
    replaceText(head, html);
}

// ==================== TIMER ====================
let timerId = null;
let timeLeft = 0;

function showTime() {
    $("timerDisplay").textContent = Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, "0");
}

function stopTimer() {
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
    $("timerBtn").textContent = "Start";
}

function resetTimer() {
    stopTimer();
    $("controls").classList.remove("timeup");
    $("timerDisplay").textContent = "--:--";
}

function toggleTimer() {
    if (timerId !== null) { resetTimer(); return; }
    let mins = parseFloat($("timerMin").value);
    if (!(mins > 0)) return;

    $("controls").classList.remove("timeup");
    timeLeft = Math.round(mins * 60);
    showTime();
    $("timerBtn").textContent = "Reset";
    timerId = setInterval(function () {
        timeLeft--;
        showTime();
        if (timeLeft <= 0) {
            // time is up: play the sound, but do NOT stop the game - the teacher ends it
            stopTimer();
            $("controls").classList.add("timeup");
            let snd = new Audio("audio/timeUp.mp3");
            let p = snd.play();
            if (p && p.catch) p.catch(function () {});
        }
    }, 1000);
}

// ==================== END OF GAME ====================
/* Ends the game. winner is "a", "b" or "tie".
   The insects that were never found are then shown on the board(s). */
function endGame(winner, revealDelay) {
    gameOver = true;
    stopTimer();
    $("score1").classList.toggle("winner", winner == "a");
    $("score2").classList.toggle("winner", winner == "b");
    playSound(sound, 2, "audio/", ".mp3");

    if (winner == "tie") {
        setHead("head", "It's a tie!");
        setHead("head2", "It's a tie!");
    } else {
        setHead(winner == "a" ? "head" : "head2", "You Win!!");
    }

    setTimeout(function () {
        if (winner == "a") setHead("head2", "Here's where they hid!");
        if (winner == "b") setHead("head", "Here's where they hid!");
        revealRemaining();
    }, revealDelay);
}

/* show every insect that was not completely destroyed */
function revealRemaining() {
    let boards = [
        [[centipede, "centipede"], [caterpillar, "caterpillar"], [[mosquito1], "mosquito"], [[mosquito2], "mosquito"]],
        [[centipede2, "centipede"], [caterpillar2, "caterpillar"], [[mosquito3], "mosquito"], [[mosquito4], "mosquito"]]
    ];
    let n = 0;
    boards.forEach(function (board) {
        board.forEach(function (item) {
            let squares = item[0], type = item[1];
            if (allHit(squares)) return;
            setTimeout(function () { revealInsect(squares, type, true); }, 300 * n);
            n++;
        });
    });
}

$("timerBtn").addEventListener("click", toggleTimer);

/* teacher ends the game: the higher score wins */
$("endBtn").addEventListener("click", function () {
    if (gameOver) return;
    endGame(score.a > score.b ? "a" : score.b > score.a ? "b" : "tie", 0);
});

$("newBtn").addEventListener("click", function () {
    let playing = !gameOver && Object.keys(hitSquares).length > 0;
    if (playing && !confirm("Start a new game? The current game will be lost.")) return;
    location.reload();
});

/* counts the hits on each insect and returns how many hits this insect now has */
function replaceInsect(id, insect){
    let set = id.includes("a") ? "a" : "b";

    switch(insect){
        case("centipede"):
            return set == "a" ? ++centipedeHit : ++centipedeHit2;
        case("caterpillar"):
            return set == "a" ? ++caterPillarHit : ++caterPillarHit2;
        default:
            return 1;   // a mosquito dies in one hit
    }
}

//comparing mosquitos' locations with other insects
function compareMosquito(set, str1, str2, array1, array2){
    if(array1.includes(str1) || array2.includes(str1) || array1.includes(str2) || array2.includes(str2) || str1 == str2) {
        if(set == "a"){
            mosquito1 = getInsect(mosquitoArray);
            mosquito2 = getInsect(mosquitoArray);
            compareMosquito("a", mosquito1, mosquito2, caterpillar, centipede);
        } else if (set == "b") {
            mosquito3 = getInsect(mosquitoArray);
            mosquito4 = getInsect(mosquitoArray);
            compareMosquito("b", mosquito3, mosquito4, caterpillar2, centipede2);
        }
    }
}

function getHit(id) {
    // ignore clicks once the game is over, or on squares already chosen
    if (gameOver || hitSquares[id] !== undefined) return;

    if(id.includes("a")) {
        hitOrMiss(id, centipede, caterpillar, mosquito1, mosquito2, "head");
    } else {
        hitOrMiss(id, centipede2, caterpillar2, mosquito3, mosquito4, "head2");
    }
}

function hitOrMiss(id, cent, cat, m1, m2, head){
    let set = id.includes("a") ? "a" : "b";
    let type = null;
    let squares = null;

    if (cent.includes(id)) { type = "centipede"; squares = cent; }
    else if (cat.includes(id)) { type = "caterpillar"; squares = cat; }
    else if (id == m1 || id == m2) { type = "mosquito"; squares = [id]; }

    // ---- miss ----
    if (type === null) {
        hitSquares[id] = false;
        replace(id, "miss.png");
        playSound(sound, 0, "audio/", ".mp3");
        setHead(head, "You missed!");
        return;
    }

    // ---- hit (in this order) ----
    hitSquares[id] = true;
    replace(id, "hit.png");                            // 1. explosion picture
    playSound(sound, 1, "audio/", ".mp3");             // 2. sound
    addScore(set, 1);                                  // 3. +1 point
    hitEffect(id);                                     //    jiggle + flash
    let hits = replaceInsect(id, type);                //    count hits on this insect
    if (type != "mosquito") spawnSegmentIcon(id, type); // 4-7. rising icon, then faded mark

    if (allHit(squares)) {                             // insect completely destroyed
        addScore(set, 2);                              // +2 kill bonus
        revealInsect(squares, type);                   // flash + faded insect stays on board
    }

    // top bar: one icon per hit on this insect (a mosquito dies in one hit, so it shows two)
    setHead(head, "You hit the " + type + "!", type, type == "mosquito" ? 2 : hits);

    // counting the hits - the first team to find everything wins
    set == "a" ? hitCount++ : hitCount2++;
    if (hitCount >= 7 || hitCount2 >= 7) {
        // wait for the last kill reveal to play, then show the losing side's hidden insects
        endGame(set, REVEAL_DELAY + 1500);
    }
}
