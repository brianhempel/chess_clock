Visit [brianhempel.github.io/chess_clock](https://brianhempel.github.io/chess_clock/) to try it out.

Pull requests welcome.

## Development

You need a few things to run the tests: [ChromeDriver](https://code.google.com/p/chromedriver/), [Node.js](http://nodejs.org/), the Javascript [selenium-webdriver package](http://selenium.googlecode.com/git/docs/api/javascript/index.html), and [Mocha](http://mochajs.org/). On Mac OS X, this process is easier with [Homebrew](http://brew.sh/).


```
brew install chromedriver
brew install node
# make sure you are in the chess_clock directory for this npm install comannd
npm install selenium-webdriver
npm -g install mocha
```

Run the tests!

```
mocha
```

To run only certain tests, provide a [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) that will be matched against test names:

```
mocha --grep "Editing time"
# or
mocha -g Editing
```

Helpful docs:

- [Selenium Javascript guide](http://selenium.googlecode.com/git/docs/api/javascript/index.html) that should prove helpful.
- [Things you can do with a DOM node](http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebElement.html)
- [Things you can do with the driver object](http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebDriver.html)
- [Mocha test framework docs](http://mochajs.org/)
- [Node's assert module docs](http://nodejs.org/api/assert.html)
