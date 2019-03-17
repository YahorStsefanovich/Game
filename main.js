let lastClicked = null;
let cards = [];
let checkCards = [];
let nickName;
const numberOfPictures = 25;
let score;

try{
    client = new WebSocket('ws://localhost:8080');
    
    client.onopen = function() {
        console.log('client connected');
        
        client.onmessage = function(message) {
            let resultSet = JSON.parse(message.data);
            console.log(resultSet);
            initializeRecordTable(resultSet);
        };
    };
    
} catch (e) {
    console.error(e);
}

showDialog();

//выбор уровня сложности и игрового имени
function showDialog() {
    let dialog = document.getElementById('dialog');
    dialog.showModal();
    document.getElementById("startGame").onclick = function() {
        if (!(nickName = document.getElementById("nickName").value)){
            nickName = 'Inkognito';
        }
        dialog.close();
        main();
        setTimer();//запуск таймера
    };
}

//Показать список рекордов
function showRecords(_score) {
    
    document.getElementById("startNewGame").onclick = function() {
        window.location.reload();
    };
    let recordLevel;
    switch (getNumberOfParesCards()){
        case '8':
            recordLevel = 'easy';
            break;
        case '16':
            recordLevel = 'middle';
            break;
        case '24':
            recordLevel = 'hard';
            break;
    }
    
    //server comunication
    score = _score;
    let newRecord = new NewRecord(nickName, score, recordLevel);
    client.send(JSON.stringify(newRecord));
}

function initializeRecordTable(records){
    let recordsWindow = document.getElementById('records');
    
    document.getElementById("yourScore").innerHTML = 'Ваше время(' + nickName + '): ' + score;
    
    for (let i = 0; i < records.length; i++){
        let newRecord = document.createElement('div');
        newRecord.innerHTML = (i+1) + ". " + records[i].name + ": " + records[i].result;
        recordsWindow.insertBefore(newRecord, recordsWindow.getElementsByTagName('button')[0]);
    }
    
    // client.close();
    recordsWindow.showModal();
}

function main(){
    let section = document.getElementById("gameSpace");
    for (let i=1; i <= getNumberOfParesCards(); i++){
        // let image = "Images/" + (Math.floor(Math.random() * (numberOfPictures)) + 1).toString() + ".png";
        let image = "Images/1.png";
        //var color = randColor();
        let flip_container1 = makeFlipContainer(image);
        let flip_container2 = makeFlipContainer(image);
        flip_container1.setAttribute( "id", "myCard" + (2*i-1));
        flip_container2.setAttribute( "id", "myCard" + 2*i);

        cards.push(flip_container1);
        cards.push(flip_container2);
    }

    //перемешивание массива
     cards = cards.sort(function(){
         return 0.5-Math.random()
     });

    cards = cards.forEach(function (elem) {
        section.appendChild(elem);
    });

    document.getElementById("newGame").onclick = function () {
        window.location.reload();
    };
}

function makeFlipContainer(image){
    let front = document.createElement("div");
    front.classList.add("front");
    let back = document.createElement("div");
    back.classList.add("back");
    back.style.background = "#ffffff" + " url(" + image + ") no-repeat 50% 50%";
    back.style.backgroundSize = "contain";

    let flipper = document.createElement("div");
    flipper.classList.add("flipper");
    flipper.appendChild(front);
    flipper.appendChild(back);

    let flip_container = document.createElement("div");
    flip_container.classList.add("flip-container");

    flip_container.onclick = function(){
        if (checkCards.indexOf(this) === -1) {
            let elem = this;
            this.classList.toggle('flip');
            if (!lastClicked) {
                lastClicked = this;
            }
            else {
                if ((this.firstChild.lastChild.style.background === lastClicked.firstChild.lastChild.style.background) &&
                    (this.id !== lastClicked.id)) {
                    PlaySound("temp/Yes.mp3");
                    checkCards.push(this);
                    checkCards.push(lastClicked);
                    this.style.cursor = "default";
                    lastClicked.style.cursor = "default";
                    lastClicked = null;
                }
                else {
                    let temp = lastClicked;
                    lastClicked = null;
                    PlaySound("temp/No.mp3");
                    setTimeout(function () {
                        elem.classList.toggle('flip');
                        temp.classList.toggle('flip');
                        temp = null;
                    }, 1000);
                }
            }
        }
    };
    flip_container.appendChild(flipper);

    return flip_container;
}

function setTimer() {
    let sec = 0;
    let elem = document.getElementById("timer");
    elem.innerHTML = nickName + ": " +  sec;
    let timer = setInterval(function () {
        sec++;
        elem.innerHTML = nickName + ": " + sec;
        if (checkCards.length === getNumberOfParesCards()*2){
            clearInterval(timer);
            PlaySound("temp/OK.mp3");
            showRecords(sec);
        }
    }, 1000);
}

function getNumberOfParesCards() {
    let chooseLevel  = document.getElementById('chooseLevel');
    return chooseLevel[chooseLevel.selectedIndex].value;
}

function PlaySound(nameOfSong) {
    let audio = new Audio();
    audio.src = nameOfSong;
    audio.autoplay = true;
}

function NewRecord(name, score, level) {
    this.name = name;
    this.result = score;
    this.level = level;
}





