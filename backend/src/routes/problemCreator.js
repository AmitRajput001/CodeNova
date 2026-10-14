const express  = require('express');

const problemRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware');

const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem} = require('../controllers/userProblem');


// create
problemRouter.post("/create",adminMiddleware,createProblem);
// update
problemRouter.put('/update/:id',adminMiddleware,updateProblem);
// delete
problemRouter.delete('/delete/:id',adminMiddleware,deleteProblem);
// fetch
problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);//fetching all the problems
// solved Problems
problemRouter.get('/problemSolvedByUser',userMiddleware,solvedProblemByUser);

problemRouter.get('/submittedProblem/:pid',userMiddleware,submittedProblem);

module.exports = problemRouter;