// Generated by CoffeeScript 1.3.1

define('specs/account', ['mocks/hoodie', 'account'], function(CangMock, Account) {
  return describe("Account", function() {
    beforeEach(function() {
      this.app = new CangMock;
      this.account = new Account(this.app);
      spyOn(this.app, "request");
      return spyOn(this.app, "trigger");
    });
    describe(".constructor()", function() {
      beforeEach(function() {
        spyOn(Account.prototype, "authenticate");
        return spyOn(Account.prototype, "on");
      });
      _when("_couch.account.email is set", function() {
        return beforeEach(function() {
          spyOn(this.app.store.db, "getItem").andCallFake(function(key) {
            if (key === '_couch.account.email') {
              return 'joe@example.com';
            }
          });
          return it("should set @email", function() {
            var account;
            account = new Account(this.app);
            return expect(account.email).toBe('joe@example.com');
          });
        });
      });
      it("should authenticate", function() {
        var account;
        account = new Account(this.app);
        return expect(account.authenticate).wasCalled();
      });
      it("should bind to sign_in event", function() {
        var account;
        account = new Account(this.app);
        return expect(this.account.on).wasCalledWith('signed_in', account._handle_sign_in);
      });
      return it("should bind to sign_out event", function() {
        var account;
        account = new Account(this.app);
        return expect(this.account.on).wasCalledWith('signed_out', account._handle_sign_out);
      });
    });
    describe("event handlers", function() {
      describe("._handle_sign_in(@email)", function() {
        beforeEach(function() {
          spyOn(this.app.store.db, "setItem");
          return this.account._handle_sign_in('joe@example.com');
        });
        it("should set @email", function() {
          return expect(this.account.email).toBe('joe@example.com');
        });
        it("should store @email persistantly", function() {
          return expect(this.app.store.db.setItem).wasCalledWith('_couch.account.email', 'joe@example.com');
        });
        return it("should set _authenticated to true", function() {
          this.account._authenticated = false;
          this.account._handle_sign_in({
            "ok": true,
            "name": "joe@example.com",
            "roles": []
          });
          return expect(this.account._authenticated).toBe(true);
        });
      });
      return describe("._handle_sign_out()", function() {
        it("should set @email", function() {
          this.account.email = 'joe@example.com';
          this.account._handle_sign_out({
            "ok": true
          });
          return expect(this.account.email).toBeUndefined();
        });
        it("should store @email persistantly", function() {
          spyOn(this.app.store.db, "removeItem");
          this.account._handle_sign_out({
            "ok": true
          });
          return expect(this.app.store.db.removeItem).wasCalledWith('_couch.account.email');
        });
        return it("should set _authenticated to false", function() {
          this.account._authenticated = true;
          this.account._handle_sign_out({
            "ok": true
          });
          return expect(this.account._authenticated).toBe(false);
        });
      });
    });
    describe(".authenticate()", function() {
      _when("@email is undefined", function() {
        beforeEach(function() {
          delete this.account.email;
          return this.promise = this.account.authenticate();
        });
        it("should return a promise", function() {
          return expect(this.promise).toBePromise();
        });
        return it("should reject the promise", function() {
          return expect(this.promise).toBeRejected();
        });
      });
      return _when("@email is 'joe@example.com", function() {
        beforeEach(function() {
          return this.account.email = 'joe@example.com';
        });
        _and("account is already authenticated", function() {
          beforeEach(function() {
            this.account._authenticated = true;
            return this.promise = this.account.authenticate();
          });
          it("should return a promise", function() {
            return expect(this.promise).toBePromise();
          });
          return it("should resolve the promise", function() {
            return expect(this.promise).toBeResolvedWith('joe@example.com');
          });
        });
        _and("account is unauthenticated", function() {
          beforeEach(function() {
            this.account._authenticated = false;
            return this.promise = this.account.authenticate();
          });
          it("should return a promise", function() {
            return expect(this.promise).toBePromise();
          });
          return it("should reject the promise", function() {
            return expect(this.promise).toBeRejected();
          });
        });
        return _and("account has not been authenticated yet", function() {
          beforeEach(function() {
            return delete this.account._authenticated;
          });
          it("should return a promise", function() {
            return expect(this.account.authenticate()).toBePromise();
          });
          it("should send a GET /_session", function() {
            var args;
            this.account.authenticate();
            expect(this.app.request).wasCalled();
            args = this.app.request.mostRecentCall.args;
            expect(args[0]).toBe('GET');
            return expect(args[1]).toBe('/_session');
          });
          _when("authentication request is successful and returns joe@example.com", function() {
            beforeEach(function() {
              this.app.request.andCallFake(function(type, path, options) {
                if (options == null) {
                  options = {};
                }
                return typeof options.success === "function" ? options.success({
                  userCtx: {
                    name: 'joe@example.com'
                  }
                }) : void 0;
              });
              return this.promise = this.account.authenticate();
            });
            it("should set account as authenticated", function() {
              return expect(this.account._authenticated).toBe(true);
            });
            return it("should resolve the promise with 'joe@example.com'", function() {
              return expect(this.promise).toBeResolvedWith('joe@example.com');
            });
          });
          _when("authentication request is successful and returns `name: joe@example.com`", function() {
            beforeEach(function() {
              this.app.request.andCallFake(function(type, path, options) {
                if (options == null) {
                  options = {};
                }
                return typeof options.success === "function" ? options.success({
                  userCtx: {
                    name: null
                  }
                }) : void 0;
              });
              return this.promise = this.account.authenticate();
            });
            it("should set account as unauthenticated", function() {
              return expect(this.account._authenticated).toBe(false);
            });
            it("should reject the promise", function() {
              return expect(this.promise).toBeRejected();
            });
            return it("should trigger an `account:error:unauthenticated` event", function() {
              return expect(this.app.trigger).wasCalledWith('account:error:unauthenticated');
            });
          });
          return _when("authentication request has an error", function() {
            beforeEach(function() {
              this.app.request.andCallFake(function(type, path, options) {
                if (options == null) {
                  options = {};
                }
                return typeof options.error === "function" ? options.error({
                  responseText: 'error data'
                }) : void 0;
              });
              return this.promise = this.account.authenticate();
            });
            return it("should reject the promise", function() {
              return expect(this.promise).toBeRejectedWith({
                error: 'error data'
              });
            });
          });
        });
      });
    });
    describe(".sign_up(email, password, attributes = {})", function() {
      beforeEach(function() {
        var _ref;
        this.account.sign_up('joe@example.com', 'secret', {
          name: "Joe Doe",
          nick: "Foo"
        });
        _ref = this.app.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], this.options = _ref[2];
        return this.data = JSON.parse(this.options.data);
      });
      it("should send a PUT request to http://my.cou.ch/_users/org.couchdb.user%3Ajoe%40example.com", function() {
        expect(this.app.request).wasCalled();
        expect(this.type).toBe('PUT');
        return expect(this.path).toBe('/_users/org.couchdb.user%3Ajoe%40example.com');
      });
      it("should set contentType to 'application/json'", function() {
        return expect(this.options.contentType).toBe('application/json');
      });
      it("should stringify the data", function() {
        return expect(typeof this.options.data).toBe('string');
      });
      it("should have set _id to 'org.couchdb.user:joe@example.com'", function() {
        return expect(this.data._id).toBe('org.couchdb.user:joe@example.com');
      });
      it("should have set name to 'joe@example.com", function() {
        return expect(this.data.name).toBe('joe@example.com');
      });
      it("should have set type to 'user", function() {
        return expect(this.data.type).toBe('user');
      });
      it("should pass password", function() {
        return expect(this.data.password).toBe('secret');
      });
      it("should allow to signup without password", function() {
        var _ref;
        this.account.sign_up('joe@example.com');
        _ref = this.app.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], this.options = _ref[2];
        this.data = JSON.parse(this.options.data);
        return expect(this.data.password).toBeUndefined();
      });
      it("should allow to set additional attributes for the use", function() {
        expect(this.data.attributes.name).toBe('Joe Doe');
        return expect(this.data.attributes.nick).toBe('Foo');
      });
      _when("sign_up successful", function() {
        beforeEach(function() {
          return this.app.request.andCallFake(function(type, path, options) {
            var response;
            response = {
              "ok": true,
              "id": "org.couchdb.user:bizbiz",
              "rev": "1-a0134f4a9909d3b20533285c839ed830"
            };
            return options.success(response);
          });
        });
        it("should trigger `account:signed_up` event", function() {
          this.account.sign_up('joe@example.com', 'secret');
          return expect(this.app.trigger).wasCalledWith('account:signed_up', 'joe@example.com');
        });
        it("should trigger `account:signed_in` event", function() {
          this.account.sign_up('joe@example.com', 'secret');
          return expect(this.app.trigger).wasCalledWith('account:signed_in', 'joe@example.com');
        });
        return it("should resolve its promise", function() {
          var promise;
          promise = this.account.sign_up('joe@example.com', 'secret');
          return expect(promise).toBeResolvedWith('joe@example.com');
        });
      });
      return _when("sign_up has an error", function() {
        beforeEach(function() {
          return this.app.request.andCallFake(function(type, path, options) {
            return options.error({
              responseText: '{"error":"forbidden","reason":"Username may not start with underscore."}'
            });
          });
        });
        return it("should reject its promise", function() {
          var promise;
          promise = this.account.sign_up('joe@example.com', 'secret');
          return expect(promise).toBeRejectedWith({
            error: "forbidden",
            reason: "Username may not start with underscore."
          });
        });
      });
    });
    describe(".sign_in(email, password)", function() {
      beforeEach(function() {
        var _ref;
        this.account.sign_in('joe@example.com', 'secret');
        return _ref = this.app.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], this.options = _ref[2], _ref;
      });
      it("should send a POST request to http://my.cou.ch/_session", function() {
        expect(this.app.request).wasCalled();
        expect(this.type).toBe('POST');
        return expect(this.path).toBe('/_session');
      });
      it("should send email as name parameter", function() {
        return expect(this.options.data.name).toBe('joe@example.com');
      });
      it("should send password", function() {
        return expect(this.options.data.password).toBe('secret');
      });
      return _when("sign_up successful", function() {
        beforeEach(function() {
          return this.app.request.andCallFake(function(type, path, options) {
            return options.success();
          });
        });
        return it("should trigger `account:signed_in` event", function() {
          this.account.sign_in('joe@example.com', 'secret');
          return expect(this.app.trigger).wasCalledWith('account:signed_in', 'joe@example.com');
        });
      });
    });
    describe(".change_password(email, password)", function() {
      return it("should have some specs");
    });
    describe(".sign_out()", function() {
      beforeEach(function() {
        var _ref;
        this.account.sign_out();
        return _ref = this.app.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], this.options = _ref[2], _ref;
      });
      it("should send a DELETE request to http://my.cou.ch/_session", function() {
        expect(this.app.request).wasCalled();
        expect(this.type).toBe('DELETE');
        return expect(this.path).toBe('/_session');
      });
      return _when("sign_up successful", function() {
        beforeEach(function() {
          return this.app.request.andCallFake(function(type, path, options) {
            return options.success();
          });
        });
        return it("should trigger `account:signed_out` event", function() {
          this.account.sign_out('joe@example.com', 'secret');
          return expect(this.app.trigger).wasCalledWith('account:signed_out');
        });
      });
    });
    describe(".on(event, callback)", function() {
      beforeEach(function() {
        return spyOn(this.app, "on");
      });
      return it("should proxy to @app.on() and namespace with account", function() {
        var party;
        party = jasmine.createSpy('party');
        this.account.on('funky', party);
        return (expect(this.app.on)).wasCalledWith('account:funky', party);
      });
    });
    describe(".user_db", function() {
      return _when("email is set to 'joe.doe@example.com'", function() {
        beforeEach(function() {
          return this.account.email = 'joe.doe@example.com';
        });
        return it("should return 'joe$example_com", function() {
          return (expect(this.account.user_db())).toEqual('joe_doe$example_com');
        });
      });
    });
    return describe(".fetch()", function() {
      _when("email is not set", function() {
        beforeEach(function() {
          this.account.email = null;
          return this.account.fetch();
        });
        return it("should not send any request", function() {
          return expect(this.app.request).wasNotCalled();
        });
      });
      return _when("email is joe@example.com", function() {
        beforeEach(function() {
          var _ref;
          this.account.email = 'joe@example.com';
          this.account.fetch();
          return _ref = this.app.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], this.options = _ref[2], _ref;
        });
        it("should send a GET request to http://my.cou.ch/_users/org.couchdb.user%3Ajoe%40example.com", function() {
          expect(this.app.request).wasCalled();
          expect(this.type).toBe('GET');
          return expect(this.path).toBe('/_users/org.couchdb.user%3Ajoe%40example.com');
        });
        return _when("successful", function() {
          beforeEach(function() {
            var _this = this;
            this.response = {
              "_id": "org.couchdb.user:baz",
              "_rev": "3-33e4d43a6dff5b29a4bd33f576c7824f",
              "name": "baz",
              "salt": "82163606fa5c100e0095ad63598de810",
              "password_sha": "e2e2a4d99632dc5e3fdb41d5d1ff98743a1f344e",
              "type": "user",
              "roles": []
            };
            return this.app.request.andCallFake(function(type, path, options) {
              return options.success(_this.response);
            });
          });
          return it("should resolve its promise", function() {
            var promise;
            promise = this.account.fetch();
            return expect(promise).toBeResolvedWith(this.response);
          });
        });
      });
    });
  });
});
