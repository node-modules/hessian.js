TESTS = test/**/*.test.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =

install:
	@npm install

jshint:
	@./node_modules/.bin/jshint .

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

	@NODE_ENV=test maxCacheLength=0 ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov cov: install
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-- \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

test-all: test test-cov jshint

benchmark:
	@node benchmark/encode.js
	@node benchmark/decode.js

autod: install
	@./node_modules/.bin/autod -w -e benchmark --prefix "~"
	@$(MAKE) install

.PHONY: test benchmark
