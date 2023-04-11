import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { LoadTest, LoadTestResult } from '../main/loadTest/LoadTest';
import LoadTestController from '../../controllers/LoadTestController';
import { connect } from 'react-redux';
import { RootState } from '../../toolkit-refactor/store';
import { ReqRes } from '../../../types';
import { Box } from '@mui/material';
import { SwellWrappedTooltip } from '../customMuiStyles/tooltip';

/**
 * TestContainer component allows users to configure and perform load tests.
 * It contains inputs for the load test frequency and duration, as well as buttons
 * to start and stop the tests. The component also renders the ReqResContainer,
 * ScheduleReqResContainer, and StoppedContainer components to display the results
 * of the tests.
 */

const mapStateToProps = (store: RootState) => ({
  reqResArray: store.reqRes.reqResArray,
  currentResponse: store.reqRes.currentResponse,
});

interface TestContainerProps {
  reqResArray: ReqRes[];
  currentResponse: ReqRes;
}

const TestContainer: React.FC<TestContainerProps> = ({
  reqResArray,
  currentResponse,
}) => {
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [callsPerSecond, setCallsPerSecond] = useState<number>(1);
  const [totalTime, setTotalTime] = useState<number>(10);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const isDark = useSelector((state: any) => state.ui.isDark);

  const handleShowLoadTest = () => {
    setShowLoadTest(!showLoadTest);
  };

  const [showLoadTest, setShowLoadTest] = useState(false);

  const reqResObj: ReqRes | null = currentResponse.url
    ? currentResponse
    : reqResArray.length > 0
    ? reqResArray[reqResArray.length - 1]
    : null;

  const getDisabledReason = (): string => {
    const basePrompt = `
      Please note that this load test will execute 
      the selected request in the workspace to the left.
    `;
    if (isTestRunning) {
      return 'Load stress test is currently running.';
    } else if (!reqResObj) {
      return 'Please add workspace or send request';
    } else if (!reqResObj.url) {
      return 'URL is missing.';
    } else if (reqResObj.request.method !== 'GET' && !reqResObj.graphQL) {
      return `Only GET requests are supported for load tests. ${basePrompt}`;
    } else {
      return basePrompt;
    }
  };

  const disabled: boolean =
    isTestRunning ||
    !reqResObj ||
    !reqResObj.url ||
    (reqResObj.request.method !== 'GET' && !reqResObj.graphQL);

  return (
    <div className="mt-4 mb-4">
      <div
        className={`${
          isDark ? 'is-dark-200' : ''
        } is-rest-invert show-hide-event cards-dropdown minimize-card is-flex is-align-items-center is-justify-content-center`}
        onClick={handleShowLoadTest}
      >
        {showLoadTest === true && (
          <>
            <span>Hide Load Stres Test</span>
          </>
        )}

        {showLoadTest === false && (
          <>
            <span>Load Stress Test</span>
          </>
        )}
      </div>
      {showLoadTest === true && (
        <div id="test-snippets">
          <div>
            <div className="is-flex is-flex-direction-row is-justify-content-center is-align-items-center mt-2">
              <Box
                className="is-flex is-flex-direction-row is-justify-content-center is-align-items-center"
                marginRight={2}
              >
                <p>Frequency:</p>
                <input
                  className={`${
                    isDark ? 'is-dark-200' : ''
                  } ml-1 input input-is-medium is-info`}
                  style={{ width: '65px' }}
                  type="number"
                  placeholder="Calls/sec"
                  value={callsPerSecond}
                  onChange={(e) => {
                    setCallsPerSecond(Number(e.target.value));
                  }}
                />
              </Box>
              <Box
                className="is-flex is-flex-direction-row is-justify-content-center is-align-items-center"
                marginLeft={2}
              >
                <p>Duration:</p>
                <input
                  className={`${
                    isDark ? 'is-dark-200' : ''
                  } ml-1 input input-is-medium is-info`}
                  style={{ width: '65px' }}
                  type="number"
                  placeholder="Duration"
                  value={totalTime}
                  onChange={(e) => {
                    setTotalTime(Number(e.target.value));
                  }}
                />
              </Box>
            </div>
            <div className="is-flex is-flex-direction-row is-justify-content-center is-align-items-center mt-2">
              <div className="ml-2">
                <SwellWrappedTooltip
                  title={getDisabledReason()}
                  placement="top"
                >
                  <span>
                    <button
                      className={`button is-small is-primary ${
                        isDark ? '' : 'is-outlined'
                      } button-padding-vertical button-hover-color ml-3`}
                      onClick={async () => {
                        const controller = new AbortController();
                        setAbortController(controller);
                        setIsTestRunning(true);

                        if (reqResObj) {
                          let results: LoadTestResult = await LoadTest(
                            reqResObj,
                            callsPerSecond,
                            totalTime,
                            controller.signal
                          );

                          LoadTestController.processLoadTestResults(
                            reqResObj.id,
                            results
                          );
                        }
                        setIsTestRunning(false);
                      }}
                      disabled={disabled}
                      style={disabled ? { pointerEvents: 'none' } : {}}
                    >
                      Run
                    </button>
                  </span>
                </SwellWrappedTooltip>
                <button
                  className={`button is-small is-danger ${
                    isDark ? '' : 'is-outlined'
                  } button-padding-vertical button-hover-color ml-3`}
                  onClick={() => {
                    if (abortController) {
                      abortController.abort();
                      setAbortController(null);
                    }
                  }}
                >
                  Stop
                </button>
              </div>
            </div>
            <div>
              Attention: This load stress test is specifically designed for HTTP GET
              requests & GraphQL Query. This is intended for backend testing
              purposes only. Please be aware that running this test on websites
              may lead to CORS issues.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(TestContainer);
