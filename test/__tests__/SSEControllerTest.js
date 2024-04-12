const http = require('http');
const assert = require('chai').assert;
const SSEController = require('../../main_process/SSEController'); // File being tested
const SSE = require('express-sse');
const EventSource = require('eventsource');

//mock http and EventSource module
jest.mock('http');
jest.mock('eventsource');

describe('SSEController', () => {
  //define mock data
  const reqResObj = {
    response: { events: [] },
    url: 'www.fakeurl.com',
  };
  const options = {headers: {}};
  const event = {
    sender: {
      send: jest.fn(),
    },
  };
  const timeDiff = 10;
  //clear open connections after each test just in case
  afterEach(() => {
    SSEController.sseOpenConnections = {};
  });

  describe('createStream', () => {
    it('should invoke returnErrorToFrontEnd when passed empty params', async () => {
      await SSEController.createStream(reqResObj, options, event);

      expect(reqResObj.connection).toBe('error');
      expect(reqResObj.response.events.length).toBe(1);
      expect(event.sender.send).toHaveBeenCalledWith('reqResUpdate', reqResObj);
    });
  });

  describe('closeConnection', () => {
    const fakeSSE = new EventSource('www.fakeurl.com');
    it('should return undefined when invoked on an ID not found in sseOpenConnections', () => {
      expect(SSEController.closeConnection('fakeID')).toBe(undefined);
      expect(fakeSSE.close).not.toHaveBeenCalled();
    });

    it('should close an existing connection found in sseOpenConnections', () => {
      SSEController.sseOpenConnections.fakeID = fakeSSE;
      SSEController.closeConnection('fakeID');
      expect(fakeSSE.close).toHaveBeenCalled();
      expect(SSEController.sseOpenConnections).toEqual({});
    });
  });
});

