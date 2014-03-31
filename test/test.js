var url = "file://" + __dirname + "/../index.html"

var assert    = require('assert');
var webdriver = require('selenium-webdriver'),
    test      = require('selenium-webdriver/testing');
var Key       = webdriver.Key;
var driver;

console.log("Page is at: " + url); // this is how you dump stuff out

test.before(function() {
	driver = new webdriver.Builder().
	    withCapabilities(webdriver.Capabilities.chrome()).
	    build();
});

test.after(function() {
	driver.quit();
});

function body()         { return driver.findElement({css: "body"}); }
function ADiv()         { return driver.findElement({id:  "a"}); }
function BDiv()         { return driver.findElement({id:  "b"}); }
function timerA()       { return driver.findElement({css: "#a input"}); }
function timerB()       { return driver.findElement({css: "#b input"}); }
function instructions() { return driver.findElement({id:  "instructions"}); }

function timerAValue()  { return timerA().getAttribute("value"); }
function timerBValue()  { return timerB().getAttribute("value"); }

// keeps checking the assertion until it passes or 3 seconds expire
function timeout(valuePromiseFunction, assertionFunction) {
	var startTime = new Date();
	var next = function (value) {
		try {
			assertionFunction(value);
		} catch (e) {
			if (e.name === "AssertionError" && (new Date()) - startTime < 3000) {
				driver.sleep(50).then(function () { valuePromiseFunction().then(next); });
			} else {
				throw e;
			}
		}
	};
	return valuePromiseFunction().then(next);
}

test.beforeEach(function () {
	driver.get(url);
});

test.describe("Starting/pausing the timer", function() {

	test.it("is 5:00 initially", function() {
		timerAValue().then(function (value) {
			assert.equal(value, "05:00");
		});
		timerBValue().then(function (value) {
			assert.equal(value, "05:00");
		});
	});

	test.it("starts on s", function() {
		body().sendKeys('s');
		timeout(timerAValue, function (value) {
			assert.notEqual(value, "05:00");			
		});
	});

	test.it("stops on s", function() {
		body().sendKeys('ss');
		driver.sleep(2000);
		timerAValue().then(function (value) {
			assert.equal(value, "05:00");
		});
	});

	test.it("starting hides the directions", function() {
		body().sendKeys('s');
		instructions().isDisplayed().then(function (isDisplayed) {
			assert(!isDisplayed, "Expected instructions to be hidden!");
		})
	});

	test.it("pausing shows the directions", function() {
		body().sendKeys('ss');
		instructions().isDisplayed().then(function (isDisplayed) {
			assert(isDisplayed, "Expected instructions to be visible!");
		})
	});

});

test.describe("Switching turns", function() {

	test.it("can switch before starting", function() {
		body().sendKeys(' s');
		timeout(timerBValue, function (value) {
			assert.notEqual(value, "05:00");			
		});
	});

	test.it("can switch back before starting", function() {
		body().sendKeys('  s');
		timeout(timerAValue, function (value) {
			assert.notEqual(value, "05:00");			
		});
	});

	test.it("can switch after starting", function() {
		body().sendKeys('s ');
		timeout(timerBValue, function (value) {
			assert.notEqual(value, "05:00");			
		});
		timerAValue().then(function (value) {
			assert.equal(value, "05:00");
		});
	});

	test.it("can back switch after starting", function() {
		body().sendKeys('s  ');
		timeout(timerAValue, function (value) {
			assert.notEqual(value, "05:00");			
		});
		timerBValue().then(function (value) {
			assert.equal(value, "05:00");
		});
	});

});

test.describe("Editing time", function() {

	test.it("can change timer A before starting", function() {
		// you CAN just send the backspace key a bunch, without clicking
		// or call clear
		// but I want to emphasize the pain here ;)
		timerA().click();
		timerA().sendKeys(Key.END);
		timerA().sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE);
		timerA().sendKeys("00:02s");
		timeout(timerAValue, function (value) {
			assert.equal(value, "00:01");			
		});
	});

	test.it("can change timer B before starting", function() {
		// you CAN just send the backspace key a bunch, without clicking
		// or call clear
		// but I want to emphasize the pain here ;)
		timerB().click();
		timerB().sendKeys(Key.END);
		timerB().sendKeys(Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE, Key.BACK_SPACE);
		timerB().sendKeys("00:02s");
		body().sendKeys(" ")
		timeout(timerBValue, function (value) {
			assert.equal(value, "00:01");			
		});
	});


	test.it("can change timer A when paused", function() {
		body().sendKeys("ss")
		timerA().clear();
		timerA().sendKeys("00:02s");
		timeout(timerAValue, function (value) {
			assert.equal(value, "00:01");			
		});
	});

	test.it("can change timer B when paused", function() {
		body().sendKeys("ss")
		timerB().clear();
		timerB().sendKeys("00:02s");
		body().sendKeys(" ")
		timeout(timerBValue, function (value) {
			assert.equal(value, "00:01");			
		});
	});

});

test.describe("Game over", function() {

	test.it("B wins if A's time runs out", function() {
		timerA().clear();
		timerA().sendKeys("00:00s");
		ADiv().getAttribute("class").then(function (classes) {
			assert(classes.match("loser"), "Expected A to have loser class! Got: " + classes);
		});
		BDiv().getAttribute("class").then(function (classes) {
			assert(classes.match("winner"), "Expected B to have winner class! Got: " + classes);
		});
	});

	test.it("A wins if B's time runs out", function() {
		timerB().clear();
		timerB().sendKeys("00:00s");
		BDiv().getAttribute("class").then(function (classes) {
			assert(classes.match("loser"), "Expected B to have loser class! Got: " + classes);
		});
		ADiv().getAttribute("class").then(function (classes) {
			assert(classes.match("winner"), "Expected A to have winner class! Got: " + classes);
		});
	});

	test.it("the directions reappear", function() {
		timerA().clear();
		timerA().sendKeys("00:00s");
		instructions().isDisplayed().then(function (isDisplayed) {
			assert(isDisplayed, "Expected instructions to be visible!");
		})
	});

	test.it("the timers stop", function() {
		timerA().clear();
		timerA().sendKeys("00:00s");
		driver.sleep(1100);
		timerAValue().then(function (value) {
			assert.equal(value, "00:00");
		});
		timerBValue().then(function (value) {
			assert.equal(value, "05:00");
		});
	});

});