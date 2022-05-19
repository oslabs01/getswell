import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
// Give composer access to both business Redux store slice and all actions
import { useDispatch } from 'react-redux';
import * as actions from '../../../features/business/businessSlice';
import * as uiactions from '../../../features/ui/uiSlice';
// Import controllers
import connectionController from '../../../controllers/reqResController';
import historyController from '../../../controllers/historyController';
// Import local components
import Http2EndpointForm from './Http2EndpointForm';
import Http2MetaData from './Http2MetaData';
// TODO: refactor all of the below components to use MUI, place them in a new "components" folder
import RestMethodAndEndpointEntryForm from '../new-request/RestMethodAndEndpointEntryForm';
import HeaderEntryForm from '../new-request/HeaderEntryForm';
import CookieEntryForm from '../new-request/CookieEntryForm';
import SendRequestButton from '../new-request/SendRequestButton';
import NewRequestButton from '../new-request/NewRequestButton';
import BodyEntryForm from '../new-request/BodyEntryForm';
import TestEntryForm from '../new-request/TestEntryForm';
// Import MUI components
import { Box, Typography } from '@mui/material';
import { BooleanValueNode } from 'graphql';

// Translated from RestContainer.jsx
export default function Http2Composer(props) {
  interface Parameter {
    id: string;
    key: string;
    value: string;
    toggle: boolean;
  }
  interface Header {
    id: string;
    key: string;
    value: string;
    toggle: boolean;
  }
  interface Cookie {
    id: string;
    key: string;
    value: string;
    toggle: BooleanValueNode;
  }

  const [parameters, setParameters] = useState<Parameter[]>([])
  const [headers, setHeaders] = useState<Header[]>([])
  const [cookies, setCookies] = useState<Cookie[]>([])
  const [http2Method, setHttp2Method] = useState('GET')
  const [http2Uri, setHttp2Uri] = useState('')

  const dispatch = useDispatch();
  // Destructuring business store props.
  const {
    currentTab,
    newRequestFields,
    newRequestHeaders,
    newRequestBody,
    newRequestCookies,
    newRequestStreams,
    newRequestSSE,
    warningMessage,
  } = props;

  // console.log(newRequestBody)

  const {
    gRPC,
    url,
    method,
    graphQL,
    restUrl,
    wsUrl,
    webrtc,
    gqlUrl,
    grpcUrl,
    network,
    testContent,
  } = newRequestFields;

  const {
    JSONFormatted,
    rawType,
    bodyContent,
    bodyVariables,
    bodyType,
  } = newRequestBody;

  // Destructuring dispatch props.
  const {
    setNewRequestFields,
    resetComposerFields,
    setNewRequestBody,
    setNewTestContent,
    setNewRequestHeaders,
    setNewRequestCookies,
    setNewRequestStreams,
    setNewRequestSSE,
    setComposerWarningMessage,
    setWorkspaceActiveTab,
    reqResAdd
  } = props;

  const { protoPath } = newRequestSSE;
  const { headersArr } = newRequestHeaders;
  const { cookiesArr } = newRequestCookies;
  const { isSSE } = newRequestSSE;

  /**
   * Validates the request before it is sent.
   * @returns ValidationMessage
   */
  const requestValidationCheck = () => {
    interface ValidationMessage {
      uri?: string;
      json?: string;
    };
    const validationMessage: ValidationMessage = {}
    // Error conditions...
    if (/https?:\/\/$|wss?:\/\/$/.test(url)) {
      //if url is only http/https/ws/wss://
      validationMessage.uri = 'Enter a valid URI';
    }
    if (!/(https?:\/\/)|(wss?:\/\/)/.test(url)) {
      //if url doesn't have http/https/ws/wss://
      validationMessage.uri = 'Enter a valid URI';
    }
    if (!JSONFormatted && rawType === 'application/json') {
      validationMessage.json = 'Please fix JSON body formatting errors';
    }
    return validationMessage;
  };

  // TODO: what does this function do?
  const sendNewRequest = () => {
    const warnings = requestValidationCheck();
    if (Object.keys(warnings).length > 0) {
      setComposerWarningMessage(warnings);
      return;
    }

    let reqRes;
    const protocol = url.match(/(https?:\/\/)|(wss?:\/\/)/)[0];
    // HTTP && GRAPHQL QUERY & MUTATION REQUESTS
    if (!/wss?:\/\//.test(protocol) && !gRPC) {
      const URIWithoutProtocol = `${url.split(protocol)[1]}/`;
      URIWithoutProtocol; // deleteable ???
      const host = protocol + URIWithoutProtocol.split('/')[0];
      let path = `/${URIWithoutProtocol.split('/')
        .splice(1)
        .join('/')
        .replace(/\/{2,}/g, '/')}`;
      if (path.charAt(path.length - 1) === '/' && path.length > 1) {
        path = path.substring(0, path.length - 1);
      }
      path = path.replace(/https?:\//g, 'http://');
      reqRes = {
        id: uuid(),
        createdAt: new Date(),
        protocol: url.match(/https?:\/\//)[0],
        host,
        path,
        url,
        webrtc,
        graphQL,
        gRPC,
        timeSent: null,
        timeReceived: null,
        connection: 'uninitialized',
        connectionType: null,
        checkSelected: false,
        protoPath,
        request: {
          method,
          headers: headersArr.filter((header) => header.active && !!header.key),
          cookies: cookiesArr.filter((cookie) => cookie.active && !!cookie.key),
          body: bodyContent || '',
          bodyType,
          bodyVariables: bodyVariables || '',
          rawType,
          isSSE,
          network,
          restUrl,
          testContent: testContent || '',
          wsUrl,
          gqlUrl,
          grpcUrl,
        },
        response: {
          headers: null,
          events: null,
        },
        checked: false,
        minimized: false,
        tab: currentTab,
      };
    }

    // add request to history
    historyController.addHistoryToIndexedDb(reqRes);
    reqResAdd(reqRes);
    // dispatch(actions.scheduledReqResUpdate(reqRes));

    //reset for next request
    resetComposerFields();
    // dispatch(actions.setResponsePaneActiveTab('events'));
    // dispatch(actions.setSidebarActiveTab('composer'));

    connectionController.openReqRes(reqRes.id);
    dispatch(
      actions.saveCurrentResponseData(
        reqRes,
        'singleReqResContainercomponentSendHandler'
      )
    );
  };

  // TODO: what does this function do?
  const addNewRequest = () => {
    const warnings = requestValidationCheck();
    if (Object.keys(warnings).length > 0) {
      setComposerWarningMessage(warnings);
      return;
    }

    let reqRes;
    const protocol = url.match(/(https?:\/\/)|(wss?:\/\/)/)[0];
    // HTTP && GRAPHQL QUERY & MUTATION REQUESTS
    if (!/wss?:\/\//.test(protocol) && !gRPC) {
      const URIWithoutProtocol = `${url.split(protocol)[1]}/`;
      URIWithoutProtocol; // deleteable ???
      const host = protocol + URIWithoutProtocol.split('/')[0];
      let path = `/${URIWithoutProtocol.split('/')
        .splice(1)
        .join('/')
        .replace(/\/{2,}/g, '/')}`;
      if (path.charAt(path.length - 1) === '/' && path.length > 1) {
        path = path.substring(0, path.length - 1);
      }
      path = path.replace(/https?:\//g, 'http://');
      reqRes = {
        id: uuid(),
        createdAt: new Date(),
        protocol: url.match(/https?:\/\//)[0],
        host,
        path,
        url,
        webrtc,
        graphQL,
        gRPC,
        timeSent: null,
        timeReceived: null,
        connection: 'uninitialized',
        connectionType: null,
        checkSelected: false,
        protoPath,
        request: {
          method,
          headers: headersArr.filter((header) => header.active && !!header.key),
          cookies: cookiesArr.filter((cookie) => cookie.active && !!cookie.key),
          body: bodyContent || '',
          bodyType,
          bodyVariables: bodyVariables || '',
          rawType,
          isSSE,
          network,
          restUrl,
          testContent: testContent || '',
          wsUrl,
          gqlUrl,
          grpcUrl,
        },
        response: {
          headers: null,
          events: null,
        },
        checked: false,
        minimized: false,
        tab: currentTab,
      };
    }

    // add request to history
    historyController.addHistoryToIndexedDb(reqRes);
    reqResAdd(reqRes);

    //reset for next request
    resetComposerFields();
    setWorkspaceActiveTab('workspace');
  };

  const handleSSEPayload = (e) => {
    setNewRequestSSE(e.target.checked);
  };

  return(
    <Box
      className="is-flex-grow-3 add-vertical-scroll"
      sx={{
        height: '40%',
        px: 1,
        overflowX: 'scroll',
        overflowY: 'scroll',
      }}
      id = "composer-http2"
    >
      {/* <Typography align='center'>
        HTTP/2
      </Typography> */}
      {/**
       * TODO:
       * The two commented components are our attempt to port the entire app to use MaterialUI for consistency.
       * The first one...
       * ... is an HTTP2Enpoint form with a (1) method select (2) endpoint form (3) send button.
       * The second one...
       * ... is all of the metadata you would need for an HTTP2 request (parameters, headers, body, cookies)
       * These are not tied to the Redux store currently, and thus do not interact with the app yet.
       * They are just standalone components that need to be integrated with the logic of the app.
       */}
      {/* <Http2EndpointForm
        http2Method={http2Method}
        setHttp2Method={setHttp2Method}
        http2Uri={http2Uri}
        setHttp2Uri={setHttp2Uri}
      />
      <Http2MetaData
        parameters={parameters}
        setParameters={setParameters}
        headers={headers}
        setHeaders={setHeaders}
        cookies={cookies}
        setCookies={setCookies}
        http2Method={http2Method}
      /> */}
      <RestMethodAndEndpointEntryForm
        newRequestFields={newRequestFields}
        newRequestBody={newRequestBody}
        setNewTestContent={setNewTestContent}
        setNewRequestFields={setNewRequestFields}
        setNewRequestBody={setNewRequestBody}
        warningMessage={warningMessage}
        setComposerWarningMessage={setComposerWarningMessage}
      />
      <span className="inputs">
        <div>
          <HeaderEntryForm
            newRequestHeaders={newRequestHeaders}
            newRequestStreams={newRequestStreams}
            newRequestBody={newRequestBody}
            newRequestFields={newRequestFields}
            setNewRequestHeaders={setNewRequestHeaders}
            setNewRequestStreams={setNewRequestStreams}
          />
          <CookieEntryForm
            newRequestCookies={newRequestCookies}
            newRequestBody={newRequestBody}
            setNewRequestCookies={setNewRequestCookies}
          />
        </div>
        <div className="is-3rem-footer is-clickable restReqBtns">
          <SendRequestButton onClick={sendNewRequest} />
          <p> --- or --- </p>
          <NewRequestButton onClick={addNewRequest} />
        </div>
      </span>
      {/* SSE TOGGLE SWITCH */}
      <div className="field mt-2">
        <span className="composer-section-title mr-3">
          Server Sent Events
        </span>
        <input
          id="SSEswitch"
          type="checkbox"
          className="switch is-outlined is-warning"
          onChange={(e) => {
            handleSSEPayload(e);
          }}
          checked={isSSE}
        />
        <label htmlFor="SSEswitch" />
      </div>
      {method !== 'GET' && (
        <BodyEntryForm
          warningMessage={warningMessage}
          newRequestBody={newRequestBody}
          setNewRequestBody={setNewRequestBody}
          newRequestHeaders={newRequestHeaders}
          setNewRequestHeaders={setNewRequestHeaders}
        />
      )}
      <TestEntryForm
        setNewTestContent={setNewTestContent}
        testContent={testContent}
      />
    </Box>
  )
}