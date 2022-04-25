/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import * as actions from '../../actions/actions';
import historyController from '../../controllers/historyController';
import connectionController from '../../controllers/reqResController';
import HeaderEntryForm from './NewRequest/HeaderEntryForm';
import BodyEntryForm from './NewRequest/BodyEntryForm.jsx';
import TestEntryForm from './NewRequest/TestEntryForm.jsx';
import CookieEntryForm from './NewRequest/CookieEntryForm.jsx';
import RestMethodAndEndpointEntryForm from './NewRequest/RestMethodAndEndpointEntryForm.jsx';
import NewRequestButton from './NewRequest/NewRequestButton.jsx';
import SendRequestButton from './NewRequest/SendRequestButton.jsx'
import RestRequestContent from '../display/RestRequestContent';
import SingleReqResContainer from '../containers/SingleReqResContainer';

function RestContainer(props) {
  const dispatch = useDispatch();

  const {
    resetComposerFields,
    setNewRequestFields,
    newRequestFields,
    newRequestFields: {
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
    },
    setNewRequestBody,
    setNewTestContent,
    newRequestBody,
    newRequestBody: {
      JSONFormatted,
      rawType,
      bodyContent,
      bodyVariables,
      bodyType,
    },
    setNewRequestHeaders,
    newRequestHeaders,
    newRequestHeaders: { headersArr },
    setNewRequestCookies,
    newRequestCookies,
    newRequestCookies: { cookiesArr },
    setNewRequestStreams,
    newRequestStreams,
    newRequestStreams: { protoPath },
    setNewRequestSSE,
    newRequestSSE: { isSSE },
    currentTab,
    introspectionData,
    setComposerWarningMessage,
    setComposerDisplay,
    warningMessage,
    reqResAdd,
    setWorkspaceActiveTab
  } = props;

  const requestValidationCheck = () => {
    const validationMessage = {};
    //Error conditions...
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

  const isDark = useSelector((state) => state.ui.isDark);

  return (
    <div className="is-flex is-flex-direction-column is-justify-content-space-between is-tall">
      <div
        className="is-flex-grow-3 add-vertical-scroll"
        style={{ overflowX: 'hidden' }}
      >
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
              isDark={isDark}
            />
            <CookieEntryForm
              newRequestCookies={newRequestCookies}
              newRequestBody={newRequestBody}
              setNewRequestCookies={setNewRequestCookies}
              isDark={isDark}
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
      </div>

    </div>
  );
}

export default RestContainer;
