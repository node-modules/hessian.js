TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 5000
MOCHA_OPTS =
NPM_INSTALL = npm install --registry=http://registry.npm.taobao.org --disturl=http://dist.u.qiniudn.com

install:
	@$(NPM_INSTALL)

jshint: install
	@./node_modules/.bin/jshint .

test: install
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov cov:
	@$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=travis-cov

test-cov-html:
	@rm -f coverage.html
	@$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=html-cov > coverage.html
	@ls -lh coverage.html

test-coveralls: test
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@-$(MAKE) test MOCHA_OPTS='--require blanket' REPORTER=mocha-lcov-reporter | ./node_modules/.bin/coveralls

test-all: test test-cov jshint

benchmark:
	@node benchmark/encode.js
	@node benchmark/decode.js

contributors: install
	@./node_modules/.bin/contributors -f plain -o AUTHORS

autod: install
	@./node_modules/.bin/autod -w -e benchmark --prefix "~"
	@$(MAKE) install

.PHONY: test benchmark
