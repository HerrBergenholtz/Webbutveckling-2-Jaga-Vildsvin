// Globala konstanter och variabler
var boardElem;			// Referens till div-element för "spelplanen"
const carImgs = ["car_up.png", "car_right.png", "car_down.png", "car_left.png"];
// Array med filnamn för bilderna med bilen
var carDir = 1;			// Riktning för bilen, index till carImgs
var carElem;			// Referens till img-element för bilen
const xStep = 5;		// Antal pixlar som bilen ska förflytta sig i x-led
const yStep = 5;		// eller y-led i varje steg
const timerStep = 20;	// Tid i ms mellan varje steg i förflyttningen
var timerRef = null;	// Referens till timern för bilens förflyttning
var startBtn;			// Referens till startknappen
var stopBtn;			// Referens till stoppknappen
/* === Tillägg i uppgiften === */
let hogCounterElem;
let hogCounter = 0;
let hitCounterElem;
let hitCounter = 0;
let hogElem;
let smackElem;

// ------------------------------
// Initiera globala variabler och koppla funktion till knapp
function init() {
	// Referenser till element i gränssnittet
	boardElem = document.getElementById("board");
	carElem = document.getElementById("car");
	startBtn = document.getElementById("startBtn");
	stopBtn = document.getElementById("stopBtn");
	// Lägg på händelsehanterare
	document.addEventListener("keydown", checkKey);
	// Känna av om användaren trycker på tangenter för att styra bilen
	startBtn.addEventListener("click", startGame);
	stopBtn.addEventListener("click", stopGame);
	// Aktivera/inaktivera knappar
	startBtn.disabled = false;
	stopBtn.disabled = true;
	/* === Tillägg i uppgiften === */
	hogElem = document.getElementById("pig");
	hogCounterElem = document.getElementById("pigNr");
	hitCounterElem = document.getElementById("hitCounter");
	smackElem = document.getElementById("smack");

} // End init
window.addEventListener("load", init);
// ------------------------------
// Kontrollera tangenter och styr bilen
function checkKey(e) {
	let k = e.keyCode;
	switch (k) {
		case 37: // Pil vänster
		case 90: // Z
			carDir--; // Bilens riktning 90 grader åt vänster
			if (carDir < 0) carDir = 3;
			carElem.src = "img/" + carImgs[carDir];
			break;
		case 39:  // Pil höger
		case 173: // -
			carDir++; // Bilens riktning 90 grader åt höger
			if (carDir > 3) carDir = 0;
			carElem.src = "img/" + carImgs[carDir];
			break;
	}
} // End checkKey
// ------------------------------
// Initiera spelet och starta bilens rörelse
function startGame() {
	console.log("start")
	startBtn.disabled = true;
	stopBtn.disabled = false;
	carElem.style.left = "0px";
	carElem.style.top = "0px";
	carDir = 1;
	carElem.src = "img/" + carImgs[carDir];
	moveCar();
	/* === Tillägg i uppgiften === */
	//Ställer om räknarna och anropar hogPlacer.
	hogCounter = 0;
	hitCounter = 0;
	hogPlacer();
} // End startGame
// ------------------------------
// Stoppa spelet
function stopGame() {
	if (timerRef != null) clearTimeout(timerRef);
	startBtn.disabled = false;
	stopBtn.disabled = true;
	/* === Tillägg i uppgiften === */
	//Gör så att grisen försvinner och även smack om man skulle ha träffat sista grisen.
	smackElem.style.display = "none";
	hogElem.style.display = "none";
} // End stopGame
// ------------------------------
// Flytta bilen ett steg framåt i bilens riktning
function moveCar() {
	let xLimit = boardElem.offsetWidth - carElem.offsetWidth;
	let yLimit = boardElem.offsetHeight - carElem.offsetHeight;
	let x = parseInt(carElem.style.left);	// x-koordinat (left) för bilen
	let y = parseInt(carElem.style.top);	// y-koordinat (top) för bilen
	switch (carDir) {
		case 0: // Uppåt
			y -= yStep;
			if (y < 0) y = 0;
			break;
		case 1: // Höger
			x += xStep;
			if (x > xLimit) x = xLimit;
			break;
		case 2: // Nedåt
			y += yStep;
			if (y > yLimit) y = yLimit;
			break;
		case 3: // Vänster
			x -= xStep;
			if (x < 0) x = 0;
			break;
	}
	carElem.style.left = x + "px";
	carElem.style.top = y + "px";
	timerRef = setTimeout(moveCar, timerStep);
	/* === Tillägg i uppgiften === */
	//CheckHit anropas från moveCar eftersom att då kommer den att köras varje 20 millisekunder för det är så ofta movecar körs.
	checkHit(hogElem, carElem);
} // End moveCar
// ------------------------------

//Async funktion för att placera ut grisar.
async function hogPlacer() {
	//Medans färre än tio grisar har placerats ut så kommer funktionen först invänta funktionen sussa. Sussa är också en async funktion som gör att vi kan vänta smidigt så länge vi vill.
	while (hogCounter < 10) {
		await sussa(2000);
		//Börjar med att göra så att varken smack eller hog visas, detta gör inget i första loopen men senare i loopen för at flutta dem.
		hogElem.style.display = "none";
		smackElem.style.display = "none";
		//Eftersom att grisarna ska placeras ut på slumpmässiga positioner så deklarerar vi random top och left, varje loop så definieras dem om med ett slumpmässigt tal som är mellan 0 och respektive höjd och bredd på board elementet.
		let randomTop = Math.floor(Math.random() * 450);
		let randomLeft = Math.floor(Math.random() * 830);
		//Ändrar stilen på grisen och smack för att placera ut dem på rätt positioner. Anledningen att jag även flyttar runt på smack tillsammans med grisen är eftersom att smack ska visas på samma ställe som grisen var på när den blev träffad.
		hogElem.style.top = randomTop + "px";
		hogElem.style.left = randomLeft + "px";
		//Efter grisen har fått sin nya position så visas den igen genom att ändra stilen.
		hogElem.style.display = "block";

		smackElem.style.top = randomTop + "px";
		smackElem.style.left = randomLeft + "px";
		//För varje loop så ökar vi gris räknaren.
		hogCounter++;
		hogCounterElem.innerHTML = hogCounter;
	}
	//Efter alla grisar har slumpats ut så är spelet slut och då anropas stopGame efter 2 sekunder så att man har en chans att ha ihjäl den sista grisen. 
	setTimeout(stopGame, 2000);
}

//Denna funktion hanterar träffar, den anropas i movecar så den körs konstant under spelets gång.
function checkHit(el1, el2) {
	//Ifall grisen och bilen överlappar så kommer det att räknas till som en träff och sedan så kommer grisen att gömmas vilket också gör så att de inte överlappar längre så att det endast räknas som en träff och också eftersom att man vill byta ut grisen mot smack.
	if (elementsOverlap(el1, el2)) {
		hitCounter++;
		hitCounterElem.innerHTML = hitCounter;
		hogElem.style.display = "none";
		smackElem.style.display = "block";
	}
}

//Funktion för att kontrollera om element överlappar.
function elementsOverlap(el1, el2) {
	//Här använder jag mig av metoden getBoundingClientRect() vilket ger mig storlek och position på elementen som objekt.
	const el1Properties = el1.getBoundingClientRect();
	const el2Properties = el2.getBoundingClientRect();
	//Funktionen returnerar false om någon av dessa vilkor möts, vilkoren jämför top, bottom, left och right av de två elementen.
	return !(
		el1Properties.top > el2Properties.bottom ||
		el1Properties.right < el2Properties.left ||
		el1Properties.bottom < el2Properties.top ||
		el1Properties.left > el2Properties.right
	);
}

//Detta är den funktion som jag använder för att göra så att funktioner väntar ett visst antal sekunder. Även detta är en async funktion. Det som händer när den anropas med await i en annan async funktion är att funktionen kommer att pausa och vänta tills den anropade funktionen returnerar en resolve, alltså att den har körts klart. Man kan göra detta om det t.ex är en loop som kan ta längre tid som man vill vänta på men i detta fallet så innehåller funktionen endast en rad av kod vilkte returnerar en resolve efter ett visst antal millisekunder som man anger som en parameter när man anropar funktionen.
async function sussa(sött) {
	return new Promise((resolve) => setTimeout(resolve, sött));
}