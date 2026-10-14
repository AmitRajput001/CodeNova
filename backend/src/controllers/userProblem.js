const {getLanguageById,submitBatch,submitToken} = require('../utility/problemUtility');

const Problem = require('../Models/problem');
const Submission = require('../Models/submission');
const User = require('../Models/user');

const createProblem = async (req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator
    } = req.body;

    try{
        for(const {language,completeCode} of referenceSolution){
            // source_code
            // language_id
            // stdin
            // expectedOuptut

            const languageId = getLanguageById(language);

            // creating a batch for submission
            const submissions = visibleTestCases.map((testCase)=>({
                source_code : completeCode,
                language_id : languageId,
                stdin: testCase.input,
                expected_output : testCase.output
            }));

            console.log("Submissions ", submissions);

            const submitResult  = await submitBatch(submissions);
            console.log("Submit Result" + submitResult);

            const resultToken = submitResult.map((value)=>value.token);

            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id != 3){
                   return res.status(400).send("Error Occured");
                }
            }

        }

        // Now we can store problem in DB, all the test cases has been checked

        await Problem.create({
            ...req.body,
            problemCreator : req.result._id
        })

        res.status(200).send("Problem saved Successfully");

    }
    catch(err){
        res.status(400).send("Error "+err);
    }
}

const updateProblem = async (req,res)=>{
    const {id} = req.params;
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{
        if(!id) 
            return res.status(400).send("Missing ID Field");

        const DsaProblem = await Problem.findById(id);
        if(!DsaProblem){
            return res.status(404).send("ID is not present in the server");
        }

        for(const {language,completeCode} of referenceSolution){
            // source_code
            // language_id
            // stdin
            // expectedOuptut

            const languageId = getLanguageById(language);

            // creating a batch for submission
            const submissions = visibleTestCases.map((testCase)=>({
                source_code : completeCode,
                language_id : languageId,
                stdin: testCase.input,
                expected_output : testCase.output
            }));

            console.log("Submissions ", submissions);

            const submitResult  = await submitBatch(submissions);
            console.log("Submit Result" + submitResult);

            const resultToken = submitResult.map((value)=>value.token);

            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id != 3){
                   return res.status(400).send("Error Occured");
                }
            }

        }

        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body},{runValidators:true,new : true});
       

        res.status(200).send(newProblem);

    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}


const deleteProblem = async (req,res) =>{
    const {id} = req.params;
    try{
        if(!id)  return res.status(400).send("Missing ID Field");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send("Successfully Deleted");
    }
    catch(err){
        res.status(500).send("Error: "+err);  
    }
}

const getProblemById = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id)  return res.status(400).send("ID is missing");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

        if(!getProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err);  
    }
}

const getAllProblem = async (req,res)=>{
    try{
        const getProblem = await Problem.find({}).select('_id title difficulty tags');

        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err);  
    }
}

const solvedProblemByUser = async(req,res)=>{
    try{

        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path : "problemSolved",
            select : "_id title difficulty tags"
        });

        res.status(200).send(user);

        // const count = req.result.problemSolved.length;
        // res.status(200).send(count);

    }
    catch(err){
        res.status(500).send("Server Error");
    }
}

const submittedProblem = async (req,res)=>{
    try{
        const problemId = req.params.pid;
        const userId = req.result._id;

        const ans = await Submission.find({userId,problemId}).sort({createdAt : -1});

        if(ans.length == 0){
            return res.status(200).send([]);
        }
        res.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem};
