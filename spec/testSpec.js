var request = require("request");
var baseUrl = "http://localhost:3000/"

describe("Get Requests", function() {
  describe("Get /", function() {
    it("returns status code 200", function() {
      request.get(baseUrl, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });
});

describe("Authed actions", function() {
  //Login is not successfully returning, though the server says logged in
  it("should successfully log in", function() {
    request.post({ 
      url: baseUrl + 'login',
      json: { 'username': 'test',
              'password': 'test'
            }
    }, function(error, response, body) {
      console.log(error)
      console.log(response)
      console.log(body)
        expect(body.username).toBe('test');
        done();
    });
  });

  //Passport middleware doesn't like this (could be problem with prior test)
  it('should get all the events', function() {
    request.get(baseUrl + 'webapi/events', function(error, response, body) {
      expect(response.statusCode).toBe(200);
      done();
    })
  })
  
  it("should successfully Log out", function() {
    request.post({
      url: baseUrl + "logout"
    }, function(error, response, body) {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
