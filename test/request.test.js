process.env.NODE_ENV= 'test';

const request = require('../model/Request.js');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should()
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const axios = require('axios');
const mongoose = require('mongoose');
const app = require('../app.js');
const supertest = require('supertest');
chai.use(chaiHttp);


const { updateRequestStatus } = require('../controllers/request-controller.js');
const { getRequestsWithIdandViewedByStaff } = require('../controllers/request-controller.js'); 
const { getTicketWithStaffID } = require('../controllers/request-controller.js');
const { assignRequestToStaff } = require('../controllers/request-controller.js');
const { getOpenedRequestsWithCategory } = require('../controllers/request-controller.js');
const { filterAndSortRequests } = require('../controllers/request-controller.js');
const { getInProgressRequests } = require('../controllers/request-controller.js');
const { getRequest } = require('../controllers/request-controller.js');
const { getAllRequests } = require('../controllers/request-controller.js');




describe('Requests APIs', () => {
    
    // it('should submit a request successfully', async () => {
  
    //   const requestBody = {
    //         "citizenID": "b1ad463t3-7d13-4e66-950a-0ce8f4c706c7",
    //         "serviceName": "Plot Request",        
    //         "headers": {
    //             "authorization": "eyJraWQiOiJRTVVWcTZvcTV2WTJvT1FEXC9ENmxRMCt4SUhqek80N0Y0SUpcL0VTWGZUY1k9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJiMWFkNDYzMy03ZDEzLTRlNjYtOTUwYS0wY2U4ZjRjNzA2YzciLCJjb2duaXRvOmdyb3VwcyI6WyJtZS1zb3V0aC0xX29jUFNyMlN3Vl9BVVRIWkVSTyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAubWUtc291dGgtMS5hbWF6b25hd3MuY29tXC9tZS1zb3V0aC0xX29jUFNyMlN3ViIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjIzM3V0bmJmbjZmbzZlZ3JjZGw2b2kyYmk4Iiwib3JpZ2luX2p0aSI6IjBkNDEzNjI2LTY0ZTQtNDcxZS05MDYwLTE2ZDZkODY0ZGNkNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIiwiYXV0aF90aW1lIjoxNzA2MDEwNTAzLCJleHAiOjE3MDYwOTY5MDMsImlhdCI6MTcwNjAxMDUwMywianRpIjoiZmVmNmZjMGUtNDNlZS00NzI4LWIxYmMtYzRjZjdhYTI5NzVhIiwidXNlcm5hbWUiOiJhdXRoemVyb19hdXRoMHw2NTgzZThiNWZlZGMwZGZlY2JkZWQ3YzIifQ.G0GJnJuWa-M8wPe4KGBHMkKvazH2f_i64jCmM5XwDpeBBRwG2tbLubPwtGeKZ4U7gMruO-XLs9CteJfR2nPsRkiCFVMpRg5DbVW-xWrmt0Bg9hOgrdfRCIrz5crFKi-QqTeL4R2o6R4MEW8-9M0DTKojVJcobzea504Nws2_26_drYU98AP6Qf71kuvtQQlqnJjp23jLq_EMBrO5KK0brB-h6R9z5fE7uXTkHWSRyfb7wb8LFDT1hXsfERrNtGg8ijp-EltVd1xh49Wm9JL60X2Ixm58DYWISl3DXHoP2n2ECGNo4lGIs_k4vpLL9NCHl4TnsQ-FE-E8l8CwS_y4pg"
    //         },
    //         "service_id": "SV01",
    //               "additional_fields": [
    //                   {
    //                       "field_name": "Scanned Image of Passport",
    //                       "field_type": "document",
    //                       "value": "eb9eg",
    //                       "document_type": "NATIONALID",
    //                       "ai_fields": {},
    //                       "is_required": true,
    //                       "is_ai_compatible": true
    //                   },
    //                   {
    //                       "condition": {
    //                           "condition_type": "selection",
    //                           "values": [
    //                               "UAE",
    //                               "EGY"
    //                           ]
    //                       },
    //                       "field_name": "Nationality",
    //                       "field_type": "text",
    //                       "value": "EGY",
    //                       "is_required": true,
    //                       "is_ai_compatible": false
    //                   },
    //                   {
    //                       "condition": {
    //                           "condition_type": "min-max",
    //                           "values": [
    //                               18,
    //                               120
    //                           ]
    //                       },
    //                       "field_name": "Age",
    //                       "field_type": "meta",
    //                       "value": "21",
    //                       "is_required": false,
    //                       "is_ai_compatible": false
    //                   }
    //               ],
    //               "service_name": "Plot Request",
    //               "service_type": "Request",
    //               "department": "Housing",
    //               "sla_value": 30,
    //               "sla_unit": "Days",
    //               "description": "This application allows the issuance of a residential plot under the approval of Emiri Diwan \nThe applicant must meet the following conditions to get approval: \n-Meets the Legal Age \n-UAE or EGY Citizenship",
    //               "points": 0
    //           };
  
    //     const response = await chai.request(app)
    //     .post('/service/request/submitRequest')
    //     .set(
    //         "authorization", "Bearer eyJraWQiOiJRTVVWcTZvcTV2WTJvT1FEXC9ENmxRMCt4SUhqek80N0Y0SUpcL0VTWGZUY1k9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJiMWFkNDYzMy03ZDEzLTRlNjYtOTUwYS0wY2U4ZjRjNzA2YzciLCJjb2duaXRvOmdyb3VwcyI6WyJtZS1zb3V0aC0xX29jUFNyMlN3Vl9BVVRIWkVSTyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAubWUtc291dGgtMS5hbWF6b25hd3MuY29tXC9tZS1zb3V0aC0xX29jUFNyMlN3ViIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjIzM3V0bmJmbjZmbzZlZ3JjZGw2b2kyYmk4Iiwib3JpZ2luX2p0aSI6IjBkNDEzNjI2LTY0ZTQtNDcxZS05MDYwLTE2ZDZkODY0ZGNkNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIiwiYXV0aF90aW1lIjoxNzA2MDEwNTAzLCJleHAiOjE3MDYwOTY5MDMsImlhdCI6MTcwNjAxMDUwMywianRpIjoiZmVmNmZjMGUtNDNlZS00NzI4LWIxYmMtYzRjZjdhYTI5NzVhIiwidXNlcm5hbWUiOiJhdXRoemVyb19hdXRoMHw2NTgzZThiNWZlZGMwZGZlY2JkZWQ3YzIifQ.G0GJnJuWa-M8wPe4KGBHMkKvazH2f_i64jCmM5XwDpeBBRwG2tbLubPwtGeKZ4U7gMruO-XLs9CteJfR2nPsRkiCFVMpRg5DbVW-xWrmt0Bg9hOgrdfRCIrz5crFKi-QqTeL4R2o6R4MEW8-9M0DTKojVJcobzea504Nws2_26_drYU98AP6Qf71kuvtQQlqnJjp23jLq_EMBrO5KK0brB-h6R9z5fE7uXTkHWSRyfb7wb8LFDT1hXsfERrNtGg8ijp-EltVd1xh49Wm9JL60X2Ixm58DYWISl3DXHoP2n2ECGNo4lGIs_k4vpLL9NCHl4TnsQ-FE-E8l8CwS_y4pg"
    //     )
    //     .send(requestBody)

    //     expect(requestBody).to.exist;
    //     expect(response.body).to.have.property('message').to.equal('Request submitted successfully!');
    //     //console.log(JSON.stringify(response));
    //     expect(response.status).to.equal(200);
  
      
    // });

    it('should get all requests successfully', async () => {
      const response = await chai.request(app)
        .get('/service/request/getAllRequests');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.length.greaterThan(1);
    });
    


    it('should get a request by ID successfully', async () => {
        mockRequest = { params: { id: '65af9aa98cae17352137c7e7' } };
        response=chai.request(app)
        .get('/service/request/getRequest/' + mockRequest.params.id)
        .set("authorization", "Bearer eyJraWQiOiJRTVVWcTZvcTV2WTJvT1FEXC9ENmxRMCt4SUhqek80N0Y0SUpcL0VTWGZUY1k9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJiMWFkNDYzMy03ZDEzLTRlNjYtOTUwYS0wY2U4ZjRjNzA2YzciLCJjb2duaXRvOmdyb3VwcyI6WyJtZS1zb3V0aC0xX29jUFNyMlN3Vl9BVVRIWkVSTyJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAubWUtc291dGgtMS5hbWF6b25hd3MuY29tXC9tZS1zb3V0aC0xX29jUFNyMlN3ViIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjIzM3V0bmJmbjZmbzZlZ3JjZGw2b2kyYmk4Iiwib3JpZ2luX2p0aSI6IjBkNDEzNjI2LTY0ZTQtNDcxZS05MDYwLTE2ZDZkODY0ZGNkNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIiwiYXV0aF90aW1lIjoxNzA2MDEwNTAzLCJleHAiOjE3MDYwOTY5MDMsImlhdCI6MTcwNjAxMDUwMywianRpIjoiZmVmNmZjMGUtNDNlZS00NzI4LWIxYmMtYzRjZjdhYTI5NzVhIiwidXNlcm5hbWUiOiJhdXRoemVyb19hdXRoMHw2NTgzZThiNWZlZGMwZGZlY2JkZWQ3YzIifQ.G0GJnJuWa-M8wPe4KGBHMkKvazH2f_i64jCmM5XwDpeBBRwG2tbLubPwtGeKZ4U7gMruO-XLs9CteJfR2nPsRkiCFVMpRg5DbVW-xWrmt0Bg9hOgrdfRCIrz5crFKi-QqTeL4R2o6R4MEW8-9M0DTKojVJcobzea504Nws2_26_drYU98AP6Qf71kuvtQQlqnJjp23jLq_EMBrO5KK0brB-h6R9z5fE7uXTkHWSRyfb7wb8LFDT1hXsfERrNtGg8ijp-EltVd1xh49Wm9JL60X2Ixm58DYWISl3DXHoP2n2ECGNo4lGIs_k4vpLL9NCHl4TnsQ-FE-E8l8CwS_y4pg");
        //const response= await getRequest(mockRequest);
        expect(response.status).to.equal(200);
        expect(response).to.be.an('object');

    });

    // it('should get in-progress requests successfully', async () => {
    //     //const mockRequest = { status: 'VIEWED_BY_STAFF' };
    //     const response= await getInProgressRequests();
    //     console.log(response);
    //     expect(response).to.be.an('array');
    //     expect(response).to.have.length.greaterThan(0);

    //     });

    // it('should filter and sort requests successfully', async () => {
      //   let mockRequest = { params: {searchString: 'c7'}};
      //   console.log(mockRequest)
      //   const response= await filterAndSortRequests(mockRequest);
      //   expect(response).to.be.an('array');
      //   expect(response).to.have.length.greaterThan(0);
      // });

    //   it('should update request status', async () => {
    //     const mockRequest = {
    //       params: { id: '65a501492af897699acc218a' },
    //       body: { status: 'VIEWED_BY_STAFF' },
    //     };
    //       console.log(mockRequest)
    //       const response= await updateRequestStatus(mockRequest);
    //       expect(response).to.be.an('object');
    //       //expect(response).to.have.length.greaterThan(0);
    // });

    // it('Should return requests that Opened With Category', async () => {
    //   const mockRequest = { body: { serviceName: 'Health Card Issuance' } };
    //   console.log(mockRequest)
    //   const response= await getOpenedRequestsWithCategory(mockRequest);
    //   expect(response).to.be.an('function');
    //   //expect(response).to.have.length.greaterThan(0);

    // });

//////////////////////////////////////////////////////////////////////////////////////////////
      
// it("should return assigned Request To Staff", async () => {
//   const mockRequest = {
//     body: {
//       id: "65a501342af897699acc2183",
//       assignedTo: "659e4f35b47660514d49f9d8",
//     },
//     };
//     const response= await assignRequestToStaff(mockRequest);
//     expect(response).to.be.an('array');
//     expect(response).to.have.length.greaterThan(0);

// });

// it('Should return Requests With Id and Viewed By Staff', async () => {
//       const mockRequest = { body: { assignedTo: "659e4f35b47660514d49f9d8" } };
//       console.log(mockRequest)
//       const response= await getRequestsWithIdandViewedByStaff(mockRequest);
//       expect(response).to.be.an('function');
//       //expect(response).to.have.length.greaterThan(0);

//     });

//     it('should test two values....', ()=> {
//         //acual test code
//         let expectedVal = 10;
//         let actualVal = 10;

//         expect(actualVal).to.be.equal(expectedVal);
//     });
});