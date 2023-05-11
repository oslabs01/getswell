import React from 'react';
import { useSelector } from 'react-redux';
import ContentReqRowComposer from '../sharedComponents/requestForms/ContentReqRowComposer';
import { OpenAPIRequest } from '../../../../types';

interface OpenAPIServerFormProps {
  newRequestsOpenAPI: OpenAPIRequest;
  openApiRequestsReplaced: (data: OpenAPIRequest) => void;
}

const OpenAPIServerForm: React.FC<OpenAPIServerFormProps> = ({
  newRequestsOpenAPI,
  openApiRequestsReplaced,
}) => {
  const onChangeUpdateHeader = (id: number, field: string, value: string) => {
    const serversDeepCopy = structuredClone(newRequestsOpenAPI.openapiMetadata.serverUrls);
    // find server to update
    let indexToBeUpdated;
    for (let i = 0; i < serversDeepCopy.length; i += 1) {
      if (serversDeepCopy[i].id === id) {
        indexToBeUpdated = i;
        break;
      }
    }

    // update
    serversDeepCopy[indexToBeUpdated][field] = value;

    // also switch checkbox if they are typing
    if (field === 'key' || field === 'value') {
      serversDeepCopy[indexToBeUpdated].active = true;
    }

    openApiRequestsReplaced({
      serverUrls: serversDeepCopy,
    });
  };

  const serversArr = newRequestsOpenAPI?.openapiMetadata?.serverUrls?.map(
    (server, index) => {
      console.log(' OpenApi Server form -> newRequestsOpenAPI', newRequestsOpenAPI);
      const contentTypeServer = {
        id: Math.random() * 1000000,
        active: true,
        key: `Server ${index + 1}`,
        value: server,
      };
      return (
        <ContentReqRowComposer
          data={contentTypeServer}
          index={index}
          type="header-row"
          changeHandler={onChangeUpdateHeader}
          key={index}
        />
      );
    }
  );

  const isDark = useSelector((state) => state.ui.isDark);

  return (
    <div className="mt-2">
      <div className="is-flex is-justify-content-space-between is-align-content-center">
        <div className="composer-section-title">Servers</div>
        <button
          className={`${
            isDark ? 'is-dark-300' : ''
          } button is-small add-header-or-cookie-button`}
        >
          + Server
        </button>
      </div>
      <div>{serversArr && serversArr}</div>
    </div>
  );
};

export default OpenAPIServerForm;

// import React from 'react';
// import { useSelector } from 'react-redux';
// import ContentReqRowComposer from '../sharedComponents/requestForms/ContentReqRowComposer.tsx';

// export default function OpenAPIServerForm({
//   newRequestsOpenAPI,
//   openApiRequestsReplaced,
// }) {

//   const onChangeUpdateHeader = (id, field, value) => {
//     const serversDeepCopy = structuredClone(newRequestsOpenAPI.openapiMetadata.serverUrls);
//     // find server to update
//     let indexToBeUpdated;
//     for (let i = 0; i < serversDeepCopy.length; i += 1) {
//       if (serversDeepCopy[i].id === id) {
//         indexToBeUpdated = i;
//         break;
//       }
//     }

//     // update
//     serversDeepCopy[indexToBeUpdated][field] = value;

//     // also switch checkbox if they are typing
//     if (field === 'key' || field === 'value') {
//       serversDeepCopy[indexToBeUpdated].active = true;
//     }

//     openApiRequestsReplaced({
//       serverUrls: serversDeepCopy,
//     });
//   };

//   const serversArr = newRequestsOpenAPI?.openapiMetadata?.serverUrls?.map(
//     (server, index) => {

//       console.log(' OpenApi Server form -> newRequestsOpenAPI',newRequestsOpenAPI)
//       const contentTypeServer = {
//         id: Math.random() * 1000000,
//         active: true,
//         key: `Server ${index + 1}`,
//         value: server,
//       };
//       return (
//         <ContentReqRowComposer
//           data={contentTypeServer}
//           index={index}
//           type="header-row"
//           changeHandler={onChangeUpdateHeader}
//           key={index}
//         />
//       );
//     }
//   );

//   const isDark = useSelector((state) => state.ui.isDark);

//   return (
//     <div className="mt-2">
//       <div className="is-flex is-justify-content-space-between is-align-content-center">
//         <div className="composer-section-title">Servers</div>
//         <button
//           className={`${
//             isDark ? 'is-dark-300' : ''
//           } button is-small add-header-or-cookie-button`}
//         >
//           + Server
//         </button>
//       </div>
//       <div>{serversArr && serversArr}</div>
//     </div>
//   );
// }