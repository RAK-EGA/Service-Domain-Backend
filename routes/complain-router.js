/**
 * @swagger
 * components:
 *   schemas:
 *     Complain:
 *       type: object
 *       required:
 *         - category
 *         - subcategory
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         description:
 *           type: string
 *         imageAttachment:
 *           type: string
 *         complainName:
 *           type: string
 *         voiceRecordAttachment:
 *           type: string
 *         citizenID:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Complain
 *   description: API for managing complaints
 */

/**
 * @swagger
 * /complains:
 *   post:
 *     summary: Submit a new complain
 *     tags: [Complain]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complain'
 *     responses:
 *       '200':
 *         description: Complain submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complain'
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /complains/{id}:
 *   put:
 *     summary: Update complain status by ID
 *     tags: [Complain]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The complain ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               status:
 *                 type: string
 *             required:
 *               - status
 *     responses:
 *       '200':
 *         description: Complain status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complain'
 *       '404':
 *         description: Complain not found
 *       '500':
 *         description: Internal Server Error
 *   get:
 *     summary: Get complain by ID
 *     tags: [Complain]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The complain ID
 *     responses:
 *       '200':
 *         description: Complain retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complain'
 *       '404':
 *         description: Complain not found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /complains:
 *   get:
 *     summary: Get all complains
 *     tags: [Complain]
 *     responses:
 *       '200':
 *         description: Complains retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complain'
 *       '404':
 *         description: Complains not found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /complains/in-progress:
 *   get:
 *     summary: Get complains in progress
 *     tags: [Complain]
 *     responses:
 *       '200':
 *         description: In-progress complains retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complain'
 *       '404':
 *         description: No complaints in progress found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /complains/by-citizen/{citizenID}:
 *   get:
 *     summary: Get complains by citizen ID
 *     tags: [Complain]
 *     parameters:
 *       - in: path
 *         name: citizenID
 *         schema:
 *           type: string
 *         required: true
 *         description: The citizen ID
 *     responses:
 *       '200':
 *         description: Complains for the specified citizen retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complain'
 *       '404':
 *         description: No complains found for the specified citizen
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /complains/filter-and-sort/{searchString}:
 *   get:
 *     summary: Filter and sort complains by search string
 *     tags: [Complain]
 *     parameters:
 *       - in: path
 *         name: searchString
 *         schema:
 *           type: string
 *         required: true
 *         description: The search string
 *     responses:
 *       '200':
 *         description: Complains filtered and sorted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complain'
 *       '500':
 *         description: Internal Server Error
 */

const express = require("express");
const authenticateUser = require('../middlewares/UserAuthentication');




const {
  submitComplain,
  updateComplainStatus,
  getComplain,
  getAllComplain,
  filterAndSortTickets,
  getInProgressComplains,
  getComplainsByCitizen,
  addFeedback,
} = require("../controllers/complain-controller.js");

const complainrouter = express.Router();

// Define routes
complainrouter.post("/submit", authenticateUser, submitComplain);
complainrouter.put("/update/:id", updateComplainStatus);
complainrouter.get("/view", getAllComplain);
complainrouter.get("/view/:id", getComplain);
complainrouter.get('/filter/:searchString',filterAndSortTickets);
complainrouter.get('/viewInProgress',getInProgressComplains);
complainrouter.get('/viewComplaintsByCitizen/:citizenID',getComplainsByCitizen);
complainrouter.put('/addFeedback/:id',addFeedback);


module.exports = complainrouter;
