const axios = require("axios");

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
  };

  const normalizedLanguage = lang.trim().toLowerCase();
  const languageKey = normalizedLanguage === "cpp" ? "c++" : normalizedLanguage;
  const languageId = language[languageKey];

  if (!languageId) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  return languageId;
};

const submitBatch = async (submissions) => {
  
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  async function fetchData() {
    try {
      
      const response = await axios.request(options);
      
      return response.data;
    } catch (error) {
      console.log("Judge0 ERROR");
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      console.log("Message:", error.message);

      throw error;
    }
  }

  return await fetchData();
};

const submitToken = async (resultToken) => {
  try {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
      params: {
        tokens: resultToken.join(","),
        base64_encoded: "false",
        fields: "*",
      },
      headers: {
        "x-rapidapi-key": process.env.JUDGE0_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    };

    async function fetchData() {
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        throw error;
      }
    }

    while(true){
      const result = await fetchData();
  
      const isResultObtained = result.submissions.every((r)=>r.status_id > 2);
  
      if(isResultObtained) return result.submissions;

      await waiting(1000);

    }
  }
  catch (err) {
    throw new Error("Err" + err.message);
  }
};

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
};

module.exports = { getLanguageById, submitBatch, submitToken };
