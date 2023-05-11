
import {
    WindowExt,
    NewRequestStreams,
    $TSFixMe
  } from '../../types';

import { appDispatch } from '../toolkit-refactor/store';
const { api } = window as unknown as WindowExt;

import { newRequestStreamsSet } from '../toolkit-refactor/slices/newRequestSlice';


const grpcController: $TSFixMe = {

    protoParserReturn(newRequestStreams: NewRequestStreams): void {
        
        try {
            // Set up the listener when for parsed protos entered into textFieldArea
            api.removeAllListeners('protoParserFunc-return');
            
            api.receive('protoParserFunc-return', async function parsedProtoRes(data: string) {
                try{
                    const result: $TSFixMe = await JSON.parse(data)
                    
                    const services = result.serviceArr ? result.serviceArr : null;
                    const protoPath = result.protoPath ? result.protoPath : null;
                    const streamsArr = [newRequestStreams.streamsArr[0]];
                    const streamContent = [''];
    
                    const updatedNewRequestStream: NewRequestStreams = {
                    ...newRequestStreams,
                    selectedPackage: null,
                    selectedService: null,
                    selectedRequest: null,
                    selectedStreamingType: null,
                    selectedServiceObj: null,
                    services,
                    protoPath,
                    streamsArr,
                    streamContent,
                    count: 10,
                    }
    
                    appDispatch(newRequestStreamsSet(updatedNewRequestStream))
                } catch (err) {
                    console.log(err)
                }
            });
        } catch(err) {
        console.error(err)
        }
    },
    sendParserData(data: any): Promise<any> {
        api.removeAllListeners('protoParserFunc-return')
        api.send('protoParserFunc-request', data);
    }
}

export default grpcController;