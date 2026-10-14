const Problem = require('../Models/problem');
const Submission = require('../Models/submission');
const {getLanguageById,submitBatch,submitToken} = require('../utility/problemUtility');

const getExecutionErrorMessage = (err) => {
    const data = err.response?.data;
    if(typeof data === 'string') return data;
    if(data && typeof data === 'object') {
        const message = data.message || data.error || data.error_description;
        if(typeof message === 'string') return message;
        return JSON.stringify(data);
    }
    return err.message || 'Unknown execution error';
};

const submitCode = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code,language} = req.body;

        if(!userId || !code || !language || !problemId)
            return res.status(400).send("Some field missing");

        const normalizedLanguage = language.trim().toLowerCase() === 'cpp'
            ? 'c++'
            : language.trim().toLowerCase();

        // fetch the problem from database(to get the testcases)
        const problem = await Problem.findById(problemId);
        if(!problem)
            return res.status(404).json({
                accepted: false,
                error: 'Problem not found',
                passedTestCases: 0,
                totalTestCases: 0,
                runtime: 0,
                memory: 0,
            });
        const totalTestCases = problem.hiddenTestCases.length;

        // store the submission in DB
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language: normalizedLanguage,
            status : 'pending',
            testCasesTotal: totalTestCases
        })

        // Judge0 ko code submit krna h  
         const languageId = getLanguageById(language);
        
        // creating a batch for submission
        const submissions = problem.hiddenTestCases.map((testCase)=>({
            source_code : code,
            language_id : languageId,
            stdin: testCase.input,
            expected_output : testCase.output
        }));

        const submitResult  = await submitBatch(submissions);

        const resultToken = submitResult.map((value)=>value.token);

        const testResult = await submitToken(resultToken);
        
        // submittedResult ko update krna h
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        const failedTest = testResult.find((test) => test.status_id !== 3);
        const accepted = !failedTest && totalTestCases > 0;
        const status = accepted ? 'accepted' : failedTest?.status_id === 4 ? 'wrong' : 'error';
        const errorMessage = accepted
            ? null
            : failedTest?.compile_output || failedTest?.stderr || failedTest?.message || failedTest?.status?.description || 'Submission failed';

        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
            }
            runtime += Number.parseFloat(test.time) || 0;
            memory = Math.max(memory, Number(test.memory) || 0);
        }

        // store the result in the database
        submittedResult.status = status;
        submittedResult.errorMessage = errorMessage;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;

        await submittedResult.save();

        // problem id ko insert krenge user schema ke problem solved me ,if it is not present there
        if(accepted && !req.result.problemSolved.some((id) => id.toString() === problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(201).json({
            accepted,
            error: errorMessage,
            passedTestCases: testCasesPassed,
            totalTestCases,
            runtime,
            memory,
        });
    }
    catch(err){
        const errorMessage = getExecutionErrorMessage(err);

        console.error('Code submission failed:', {
            status: err.response?.status,
            message: err.message,
        });
        res.status(500).json({
            accepted: false,
            error: `Unable to submit code: ${errorMessage}`,
            passedTestCases: 0,
            totalTestCases: 0,
            runtime: 0,
            memory: 0,
        });
    }
}

const runCode = async (req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code,language} = req.body;

        if(!userId || !code || !language || !problemId)
            return res.status(400).send("Some field missing");

        // fetch the problem from database(to get the testcases)
        const problem = await Problem.findById(problemId);
        if(!problem)
            return res.status(404).json({ success: false, error: 'Problem not found', runtime: 0, memory: 0, testCases: [] });


        // Judge0 ko code submit krna h  
         const languageId = getLanguageById(language);
        
        // creating a batch for submission
        const submissions = problem.visibleTestCases.map((testCase)=>({
            source_code : code,
            language_id : languageId,
            stdin: testCase.input,
            expected_output : testCase.output
        }));

        const submitResult  = await submitBatch(submissions);

        const resultToken = submitResult.map((value)=>value.token);

        const testResult = await submitToken(resultToken);       

        const passedTestCases = testResult.filter((test) => test.status_id === 3).length;
        const failedTest = testResult.find((test) => test.status_id !== 3);
        const runtime = testResult.reduce((total, test) => total + (Number.parseFloat(test.time) || 0), 0);
        const memory = testResult.reduce((max, test) => Math.max(max, Number(test.memory) || 0), 0);

        res.status(200).json({
            success: testResult.length > 0 && passedTestCases === testResult.length,
            error: failedTest?.compile_output || failedTest?.stderr || failedTest?.message || failedTest?.status?.description || null,
            passedTestCases,
            totalTestCases: testResult.length,
            runtime,
            memory,
            testCases: testResult,
        });

    }
    catch(err){
        const errorMessage = getExecutionErrorMessage(err);

        console.error('Code execution failed:', {
            status: err.response?.status,
            message: err.message,
        });
        res.status(500).json({
            success: false,
            error: `Unable to run code: ${errorMessage}`,
            runtime: 0,
            memory: 0,
            testCases: [],
        });
    }
}

module.exports = {submitCode,runCode};
