/**
*@swagger
*components:
*    schemas:
*        Complain:
*            type: object
*            required:
*                - _id
*                - category
*                - subcategory
*                - descreption
*
*              
*            properties:
*                _id:
*                    type: string
*                    description: auto-generated
*                category:
*                    type: string
*                    description: descreption of the complain the citizen has
*                subcategory:
*                    type: string
*                    description: The specific problem the citizen has
*                category:
*                    type: string
*                    description: The geneeral category of the citizen's problem
*                categoryName:
                     type: string
                     description: the name of the complain which is a combination of, complaint ID and category
                 location:
                     type: string
                     description: the location of the submitted complaint
                 imageAttachment:
                     type: string
                     description: name of the attached image to emphasize complaint
                 voiceAttachment:
                     type: string
                     description: name of the attached voice attachment to emphasize complaint
                  
                 

*              
*/
 
 
/**
* @swagger
* tags:
*   name: StaffMember
*   description: The Staff managing API
* /signin:
*   post:
*     summary: sign in for staff
*     tags: [StaffMember]
*     parameters:
*       - in: path
*         name: email
*         schema:
*           type: string
*         required: true
*         description: The staff email
*       - in: path
*         name: password
*         schema:
*           type: string
*         required: true
*         description: The staff password
*     responses:
*       201:
*         description: staff signed in .
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/StaffMember'
*       500:
*         description: Some server error
* /addstaff:
*   post:
*     summary: add new staff
*     tags: [StaffMember]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/StaffMember'
*     responses:
*       201:
*         description: new staff added
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/StaffMember'
*       500:
*         description: Some server error
* /viewstaffs:
*   get:
*     summary: Get all staff
*     tags: [StaffMember]
*     responses:
*       200:
*         description: The list of all staff
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/StaffMember'
*       404:
*         description: The announcement was not found
*       500:
*         description: Some server error
* /viewstaff/:staffID:
*   get:
*     summary: Get the staff by id
*     tags: [StaffMember]
*     parameters:
*       - in: path
*         name: _id
*         schema:
*           type: string
*         required: true
*         description: The staff id
*     responses:
*       200:
*         description: The staff response by id
*         contens:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/StaffMember'
*       404:
*         description: staff was not found
*       500:
*         description: Some server error
* /viewprofile:
*   get:
*     summary: Get staff profile
*     tags: [StaffMember]
*     responses:
*       200:
*         description: The list of all staff
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/StaffMember'
*       404:
*         description: The announcement was not found
*       500:
*         description: Some server error
* /deletestaff/:staffID:
*   delete:
*     summary: Remove the staff member by id
*     tags: [StaffMember]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The staff member's id
*
*     responses:
*       200:
*         description: The staff member was deleted
*       404:
*         description: The staff member was not found
*       500:
*        description: Some error happened
* /deletestaffs:
*   delete:
*     summary: Remove multiple staff members by id
*     tags: [StaffMember]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/StaffMember'
*     responses:
*       200:
*         description: The staff members were deleted
*       404:
*         description: The staff members were not found
*       500:
*        description: Some error happened
* /updatedepartment/:staffID:
*   patch:
*    summary: Update the staff member's department by the id
*    tags: [StaffMember]
*    parameters:
*      - in: path
*        name: _id
*        schema:
*          type: string
*        required: true
*        description: The staff member's id
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            $ref: '#/components/schemas/StaffMember'
*    responses:
*      201:
*        description: The staff member's department was updated
*        content:
*          application/json:
*            schema:
*              $ref: '#/components/schemas/StaffMember'
*      404:
*        description: The staff member was not found
*      500:
*        description: Some error happened
* /changepassword:
*   patch:
*    summary: Update the password of the logged in staff member
*    tags: [StaffMember]
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            $ref: '#/components/schemas/StaffMember'
*    responses:
*      201:
*        description: The staff member's password was updated
*        content:
*          application/json:
*            schema:
*              $ref: '#/components/schemas/StaffMember'
*      404:
*        description: The staff member was not found
*      500:
*        description: Some error happened
*/
const express = require("express");
const {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains
} = require("../controllers/complain-controller.js");

const complainrouter = express.Router();

// Define routes
complainrouter.post("/submit", submitComplain);
complainrouter.put("/update/:id", updateComplainStatus);
complainrouter.get("/view", getAllComplain);
complainrouter.get("/view/:id", getComplain);
complainrouter.get('/filter/:searchString',filterAndSortTickets);
complainrouter.get('/viewInProgress',getInProgressComplains);

module.exports = complainrouter;
